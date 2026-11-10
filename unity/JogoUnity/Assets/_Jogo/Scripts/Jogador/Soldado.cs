using System.Collections.Generic;
using Jogo.Armas;
using Jogo.Nucleo;
using UnityEngine;

namespace Jogo.Jogador
{
    /// <summary>
    /// Estado e regras de um soldado (jogador ou bot). Só o ServidorPartida chama Simular.
    /// A aparência fica no VisualSoldado.
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    public class Soldado : MonoBehaviour, IAlvoTiro
    {
        /// <summary>Soldado controlado nesta tela (câmera, HUD, visão justa).</summary>
        public static Soldado Local { get; set; }

        public string nome = "Soldado";
        [SerializeField] int equipe;
        public List<DadosArma> armasIniciais = new List<DadosArma>();

        public int Id { get; private set; }
        public int Equipe => equipe;
        public bool Vivo { get; private set; } = true;
        public Vector3 PosicaoPe => transform.position;
        public float Vida { get; private set; }
        public float Colete { get; set; }
        public bool Capacete { get; set; }

        public IReadOnlyList<EstadoArma> Armas => armas;
        public int IndiceArma { get; private set; }
        public EstadoArma ArmaAtual => armas.Count > 0 ? armas[IndiceArma] : null;

        /// <summary>Para onde o corpo aponta (plano do chão, normalizado).</summary>
        public Vector2 Direcao { get; private set; } = Vector2.up;
        public bool Movendo { get; private set; }
        public bool Devagar { get; private set; }
        public bool AtirandoFogo { get; private set; }
        public bool MirandoLuneta { get; private set; }
        public ComandoEntrada UltimoComando { get; private set; }

        public float TempoMorte { get; private set; } = -99f;
        public Soldado Matador { get; private set; }
        public float UltimoDano { get; private set; } = -99f;

        // para a apresentação interpolar entre ticks
        public Vector3 PosAnterior { get; private set; }
        public Vector3 PosAtual { get; private set; }

        CharacterController cc;
        readonly List<EstadoArma> armas = new List<EstadoArma>();
        float tempoSegurando, velVertical, esperaPasso;
        Vector2 direcaoLuneta;
        DadosRegras regras;

        void Awake()
        {
            cc = GetComponent<CharacterController>();
            gameObject.layer = 2; // Ignore Raycast: o tiro usa a conta do círculo (raio de acerto), não o colisor
            foreach (var d in armasIniciais) if (d != null) armas.Add(new EstadoArma(d));
            PosAnterior = PosAtual = transform.position;
        }

        void OnEnable()
        {
            var sv = ServidorPartida.Instancia;
            if (sv == null) { Debug.LogError("Soldado sem ServidorPartida na cena", this); return; }
            regras = sv.regras;
            Id = sv.Registrar(this);
            Vida = regras.vidaMax;
            cc.radius = regras.raioCorpo;
            cc.height = regras.alturaCorpo;
            cc.center = Vector3.up * (regras.alturaCorpo * 0.5f);
            cc.skinWidth = 0.02f;
            cc.minMoveDistance = 0f;
        }

        void OnDisable() { if (ServidorPartida.Instancia != null) ServidorPartida.Instancia.Remover(this); }

        internal void Simular(float dt, ComandoEntrada c, ServidorPartida sv)
        {
            PosAnterior = PosAtual;
            UltimoComando = c;
            foreach (var a in armas) a.Tick(dt);
            if (!Vivo) { Movendo = false; AtirandoFogo = false; MirandoLuneta = false; PosAtual = transform.position; return; }

            Vida = RegrasCombate.Regenerar(Vida, sv.Tempo - UltimoDano, dt, regras);
            if (c.trocarArma && armas.Count > 1) TrocarArma((IndiceArma + 1) % armas.Count);
            var arma = ArmaAtual;
            if (c.recarregar && arma != null) arma.IniciarRecarga();

            // --- movimento ---
            Vector2 mover = Vector2.ClampMagnitude(c.mover, 1f);
            bool gatilho = c.gatilho && arma != null;
            bool luneta = arma != null && arma.dados.luneta;
            if (luneta && gatilho) mover = Vector2.zero; // sniper mirando fica parado
            Devagar = c.devagar;
            Movendo = mover.sqrMagnitude > 0.0001f;
            bool atirandoFogo = gatilho && !luneta && arma.dados.tipo == TipoArma.Fogo;
            float vel = arma != null ? RegrasCombate.Velocidade(arma.dados, regras, atirandoFogo, Devagar) : 5f;
            velVertical = cc.isGrounded ? -1f : velVertical - regras.gravidade * dt;
            Vector3 passo = new Vector3(mover.x, 0f, mover.y) * (vel * dt) + Vector3.up * (velVertical * dt);
            if (cc.enabled) cc.Move(passo);
            AtirandoFogo = atirandoFogo;

            if (Movendo && !Devagar && (esperaPasso -= dt) <= 0f) { esperaPasso = regras.intervaloPassos; sv.Passos(this); }

            // --- para onde olha: mira; sem mira, para onde anda ---
            if (c.temMira && c.direcaoMira.sqrMagnitude > 0.0001f) Direcao = c.direcaoMira.normalized;
            else if (Movendo) Direcao = mover.normalized;

            // --- tiro ---
            if (arma == null) { PosAtual = transform.position; return; }
            if (luneta)
            {
                if (gatilho) { MirandoLuneta = true; direcaoLuneta = Direcao; }
                else if (MirandoLuneta) { MirandoLuneta = false; TentarAtirar(direcaoLuneta, sv); }
                tempoSegurando = 0f;
            }
            else
            {
                MirandoLuneta = false;
                if (atirandoFogo) { tempoSegurando += dt; if (tempoSegurando >= regras.atrasoPrimeiroTiro) TentarAtirar(Direcao, sv); }
                else { tempoSegurando = 0f; if (gatilho) TentarAtirar(Direcao, sv); }
            }
            PosAtual = transform.position;
        }

        void TrocarArma(int i)
        {
            ArmaAtual?.CancelarRecarga();
            IndiceArma = i; tempoSegurando = 0f; MirandoLuneta = false;
        }

        void TentarAtirar(Vector2 dir, ServidorPartida sv)
        {
            var arma = ArmaAtual;
            if (!arma.Disparar()) return;
            Direcao = dir;
            var d = arma.dados;
            Vector3 origem = transform.position + Vector3.up * regras.alturaTiro;

            if (d.tipo == TipoArma.Corpo) { Esfaquear(dir, d, sv, origem); return; }

            float esp = RegrasCombate.Espalhamento(d, regras, Movendo, Devagar, false);
            int n = Mathf.Max(1, d.chumbos);
            for (int i = 0; i < n; i++)
            {
                float ang = ((float)sv.sorteio.NextDouble() - 0.5f) * 2f * esp;
                Vector2 di = RegrasCombate.Girar(dir, ang);
                var r = ResolvedorTiro.Resolver(origem, di, d.alcance, regras.raioAcerto, this, sv.Alvos, sv.mascaraCenario);
                if (r.alvo is Soldado alvo) sv.AplicarDano(this, alvo, RegrasCombate.SortearDano(d, sv.sorteio), d.penetracao);
                sv.Disparou(this, r);
            }
        }

        void Esfaquear(Vector2 dir, DadosArma d, ServidorPartida sv, Vector3 origem)
        {
            foreach (var s in sv.Soldados)
            {
                if (s == this || !s.Vivo || s.Equipe == Equipe) continue;
                Vector3 off = s.PosicaoPe - transform.position;
                Vector2 o2 = new Vector2(off.x, off.z);
                if (o2.magnitude > d.alcance + 0.4f || Vector2.Angle(dir, o2) * Mathf.Deg2Rad > 0.9f) continue;
                sv.AplicarDano(this, s, RegrasCombate.SortearDano(d, sv.sorteio), d.penetracao);
                sv.Disparou(this, new ResultadoTiro { inicio = origem, fim = s.PosicaoPe + Vector3.up * regras.alturaTiro, alvo = s });
                return;
            }
            sv.Disparou(this, new ResultadoTiro { inicio = origem, fim = origem + new Vector3(dir.x, 0, dir.y) * d.alcance });
        }

        internal int ReceberDano(float dano, float penetracao, float tempo)
        {
            float colete = Colete;
            int d = RegrasCombate.DanoFinal(dano, penetracao, ref colete, Capacete);
            Colete = colete;
            Vida -= d; UltimoDano = tempo;
            return d;
        }

        internal void Morrer(Soldado matador, float tempo)
        {
            Vida = 0f; Vivo = false; Matador = matador; TempoMorte = tempo;
            MirandoLuneta = false; AtirandoFogo = false;
            cc.enabled = false; // corpo caído não bloqueia
        }

        internal void Renascer(Vector3 pos)
        {
            cc.enabled = false;
            transform.position = pos;
            PosAnterior = PosAtual = pos;
            cc.enabled = true;
            Vida = regras.vidaMax; Vivo = true; Matador = null; UltimoDano = -99f; velVertical = 0f;
            foreach (var a in armas) a.Reabastecer();
        }
    }
}
