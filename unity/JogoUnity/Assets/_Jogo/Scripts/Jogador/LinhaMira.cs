using Jogo.Armas;
using Jogo.Nucleo;
using UnityEngine;

namespace Jogo.Jogador
{
    /// <summary>Laser de mira do jogador local: sai da arma e para na primeira parede ou inimigo.</summary>
    [RequireComponent(typeof(LineRenderer))]
    public class LinhaMira : MonoBehaviour
    {
        public VisualSoldado visual;
        public Color corNormal = new Color32(0xff, 0x4a, 0x3a, 0xff);
        public Color corAtirando = new Color32(0xff, 0x7a, 0x50, 0xff);
        public Color corLuneta = new Color32(0xff, 0x2a, 0x1f, 0xff);
        public float largura = 0.05f;
        public float opacidade = 0.85f;
        [Tooltip("Distância do centro do corpo até o cano")] public float distanciaCano = 0.7f;

        LineRenderer linha;

        void Awake()
        {
            linha = GetComponent<LineRenderer>();
            linha.positionCount = 2;
            linha.useWorldSpace = true;
            linha.widthMultiplier = largura;
            linha.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
            linha.receiveShadows = false;
            linha.enabled = false;
        }

        void LateUpdate()
        {
            var s = visual != null ? visual.soldado : null;
            var sv = ServidorPartida.Instancia;
            var arma = s != null ? s.ArmaAtual : null;
            bool mostrar = s != null && sv != null && s.Vivo && arma != null && arma.dados.tipo == TipoArma.Fogo && s.UltimoComando.temMira;
            linha.enabled = mostrar;
            if (!mostrar) return;

            Vector2 d = s.Direcao;
            Vector3 pe = visual.PosicaoVisual;
            Vector3 origem = pe + Vector3.up * sv.regras.alturaTiro;
            var r = ResolvedorTiro.Resolver(origem, d, arma.dados.alcance, sv.regras.raioAcerto, s, sv.Alvos, sv.mascaraCenario);
            Vector3 dir3 = new Vector3(d.x, 0f, d.y);
            Vector3 inicio = origem + dir3 * distanciaCano;
            float comp = Mathf.Max(0.2f, (r.fim - origem).magnitude - distanciaCano);

            Color c = arma.dados.luneta ? corLuneta : s.AtirandoFogo ? corAtirando : corNormal;
            var g = new Gradient();
            g.SetKeys(new[] { new GradientColorKey(c, 0f), new GradientColorKey(c, 1f) },
                      new[] { new GradientAlphaKey(opacidade, 0f), new GradientAlphaKey(opacidade * 0.45f, 0.6f), new GradientAlphaKey(0f, 1f) });
            linha.colorGradient = g;
            linha.widthMultiplier = arma.dados.luneta ? largura * 0.7f : largura;
            linha.SetPosition(0, inicio);
            linha.SetPosition(1, inicio + dir3 * comp);
        }
    }
}
