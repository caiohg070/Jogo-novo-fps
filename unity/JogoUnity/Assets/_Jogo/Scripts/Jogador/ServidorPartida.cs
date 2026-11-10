using System;
using System.Collections.Generic;
using Jogo.Armas;
using Jogo.Nucleo;
using UnityEngine;

namespace Jogo.Jogador
{
    /// <summary>
    /// Dono da verdade da partida (servidor autoritativo). Roda em passo fixo (FixedUpdate = tick):
    /// recebe comandos, simula todos os soldados, aplica dano e avisa a apresentação por eventos.
    /// Offline ele é o "host local"; online vai rodar só no servidor.
    /// </summary>
    [DefaultExecutionOrder(-200)]
    public class ServidorPartida : MonoBehaviour
    {
        public static ServidorPartida Instancia { get; private set; }

        public DadosRegras regras;
        public DadosCamera dadosCamera;
        [Tooltip("Ticks por segundo da simulação")] public int ticksPorSegundo = 60;
        [Tooltip("O que bloqueia tiro (cenário). Soldados ficam na camada Ignore Raycast.")]
        public LayerMask mascaraCenario = Physics.DefaultRaycastLayers;

        public int Tick { get; private set; }
        public float Tempo { get; private set; }
        public IReadOnlyList<Soldado> Soldados => soldados;
        internal IReadOnlyList<IAlvoTiro> Alvos => alvos;
        internal readonly System.Random sorteio = new System.Random();

        public event Action<Soldado, ResultadoTiro> AoDisparar;
        public event Action<Soldado, Soldado, int> AoDano;      // atacante, vítima, dano
        public event Action<Soldado, Soldado> AoMorrer;         // vítima, matador
        public event Action<Soldado> AoRenascer;
        public event Action<Soldado> AoPassos;                  // passos correndo (bots ouvem)

        readonly List<Soldado> soldados = new List<Soldado>();
        readonly List<IAlvoTiro> alvos = new List<IAlvoTiro>();
        readonly Dictionary<int, ComandoEntrada> comandos = new Dictionary<int, ComandoEntrada>();
        int proximoId = 1;

        void Awake()
        {
            Instancia = this;
            Time.fixedDeltaTime = 1f / Mathf.Max(10, ticksPorSegundo);
        }

        void OnDestroy() { if (Instancia == this) Instancia = null; }

        internal int Registrar(Soldado s)
        {
            if (!soldados.Contains(s)) { soldados.Add(s); alvos.Add(s); }
            return s.Id != 0 ? s.Id : proximoId++;
        }

        internal void Remover(Soldado s)
        {
            soldados.Remove(s); alvos.Remove(s); comandos.Remove(s.Id);
        }

        /// <summary>Chega um comando (do host local ou da rede).</summary>
        public void ReceberComando(int idSoldado, in ComandoEntrada c)
        {
            // botões de "apertou" não podem se perder se chegarem 2 comandos no mesmo tick
            if (comandos.TryGetValue(idSoldado, out var antigo))
            {
                var novo = c;
                novo.recarregar |= antigo.recarregar;
                novo.trocarArma |= antigo.trocarArma;
                comandos[idSoldado] = novo;
            }
            else comandos[idSoldado] = c;
        }

        void FixedUpdate()
        {
            float dt = Time.fixedDeltaTime;
            Tick++; Tempo += dt;
            for (int i = 0; i < soldados.Count; i++)
            {
                var s = soldados[i];
                comandos.TryGetValue(s.Id, out var c);
                s.Simular(dt, c, this);
                // "apertou" vale só uma vez; o resto continua até chegar comando novo
                c.recarregar = false; c.trocarArma = false;
                comandos[s.Id] = c;
            }
        }

        internal void Disparou(Soldado atirador, in ResultadoTiro r) => AoDisparar?.Invoke(atirador, r);
        internal void Passos(Soldado s) => AoPassos?.Invoke(s);

        internal void AplicarDano(Soldado atacante, Soldado vitima, float dano, float penetracao)
        {
            if (!vitima.Vivo || (atacante != null && atacante != vitima && atacante.Equipe == vitima.Equipe)) return;
            int d = vitima.ReceberDano(dano, penetracao, Tempo);
            AoDano?.Invoke(atacante, vitima, d);
            if (vitima.Vida <= 0f)
            {
                vitima.Morrer(atacante, Tempo);
                AoMorrer?.Invoke(vitima, atacante);
            }
        }

        public void Renascer(Soldado s, Vector3 posicao)
        {
            s.Renascer(posicao);
            AoRenascer?.Invoke(s);
        }
    }
}
