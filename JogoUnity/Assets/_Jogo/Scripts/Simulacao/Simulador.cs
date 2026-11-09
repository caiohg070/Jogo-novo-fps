using System;
using System.Collections.Generic;
using Jogo.Mapa;

namespace Jogo.Simulacao
{
    /// <summary>
    /// Coração da partida. Recebe comandos e avança um tick. Não sabe nada de tela, som ou Unity:
    /// offline ele roda no celular; online o MESMO código roda no servidor dedicado.
    /// </summary>
    public class Simulador
    {
        public readonly ulong seed;
        public readonly GeradorMapa mapa;
        public uint Tick { get; private set; }
        public readonly List<EstadoJogador> jogadores = new List<EstadoJogador>();
        readonly Dictionary<int, Comando> comandos = new Dictionary<int, Comando>();

        public Simulador(ulong seed)
        {
            this.seed = seed;
            mapa = new GeradorMapa(seed);
        }

        public EstadoJogador Adicionar(int time, Vetor2 posicao, bool bot = false)
        {
            var j = new EstadoJogador(jogadores.Count, time, posicao, bot);
            j.altura = mapa.Altura(posicao.x, posicao.z);
            jogadores.Add(j);
            return j;
        }

        /// <summary>Guarda o comando do jogador para o próximo tick (o último que chegar vale).</summary>
        public void Receber(int idJogador, Comando c) => comandos[idJogador] = c;

        public void AvancarTick()
        {
            float dt = Regras.DuracaoTick;
            foreach (var j in jogadores)
            {
                if (!j.vivo || !comandos.TryGetValue(j.id, out var c)) continue;
                Mover(j, c, dt);
                j.anguloMira = c.anguloMira;
                j.ultimoTick = Tick;
            }
            comandos.Clear();
            Tick++;
        }

        void Mover(EstadoJogador j, Comando c, float dt)
        {
            var dir = c.mover;
            float forca = MathF.Min(1f, dir.Comprimento);      // servidor limita: celular não manda velocidade
            if (forca < 0.05f) return;
            float vel = c.Tem(Botoes.Silencioso) ? Regras.VelocidadeSilencioso : Regras.VelocidadeAndar;
            var nova = j.posicao + dir.Normalizado * (vel * forca * dt);
            float meio = Regras.TamanhoMapaBR / 2 - Regras.RaioCorpo;
            nova.x = Math.Clamp(nova.x, -meio, meio);
            nova.z = Math.Clamp(nova.z, -meio, meio);
            // Colisão com prédios entra aqui na etapa 2 (círculo × caixas, igual ao protótipo).
            j.posicao = nova;
            j.altura = mapa.Altura(nova.x, nova.z);
        }
    }
}
