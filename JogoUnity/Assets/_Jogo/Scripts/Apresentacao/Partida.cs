using Jogo.Simulacao;
using UnityEngine;

namespace Jogo.Apresentacao
{
    /// <summary>
    /// Liga tudo: cria o Simulador (offline = "servidor" no próprio celular), lê a entrada, avança em ticks fixos
    /// e desenha o estado com interpolação. Online, só muda de onde vem o estado (servidor) — a tela é a mesma.
    /// </summary>
    public class Partida : MonoBehaviour
    {
        [Tooltip("0 = sorteia. Use um número fixo para testar sempre o mesmo mapa.")]
        public ulong seed = 12345;

        public Simulador Sim { get; private set; }
        EstadoJogador eu;
        Transform visualEu;
        EntradaLocal entrada;
        VisualMapa visualMapa;
        float acumulado;
        Vector3 posAnterior, posAtual;

        void Start()
        {
            if (seed == 0) seed = (ulong)System.DateTime.UtcNow.Ticks;
            Sim = new Simulador(seed);
            eu = Sim.Adicionar(0, Vetor2.Zero);

            var cam = Camera.main;
            if (!cam)
            {
                var go = new GameObject("Camera");
                go.tag = "MainCamera";
                cam = go.AddComponent<Camera>();
            }
            var ct = cam.GetComponent<CameraTatica>();
            if (!ct) ct = cam.gameObject.AddComponent<CameraTatica>();

            var corpo = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            corpo.name = "Jogador";
            Destroy(corpo.GetComponent<Collider>());
            visualEu = corpo.transform;
            var nariz = GameObject.CreatePrimitive(PrimitiveType.Cube);   // mostra para onde mira
            Destroy(nariz.GetComponent<Collider>());
            nariz.transform.SetParent(visualEu, false);
            nariz.transform.localPosition = new Vector3(0, 0.3f, 0.5f);
            nariz.transform.localScale = new Vector3(0.15f, 0.15f, 0.6f);
            ct.alvo = visualEu;

            entrada = gameObject.AddComponent<EntradaLocal>();
            entrada.cam = cam;
            visualMapa = new GameObject("Mapa").AddComponent<VisualMapa>();
            visualMapa.Iniciar(Sim.mapa);

            posAnterior = posAtual = Posicao3D(eu);
            visualEu.position = posAtual;
            cam.transform.position = posAtual;
        }

        void Update()
        {
            acumulado += Time.deltaTime;
            int seguranca = 0;
            while (acumulado >= Regras.DuracaoTick && seguranca++ < 5)
            {
                acumulado -= Regras.DuracaoTick;
                Sim.Receber(eu.id, entrada.Ler(Sim.Tick, posAtual, eu.anguloMira));
                posAnterior = posAtual;
                Sim.AvancarTick();
                posAtual = Posicao3D(eu);
            }
            float k = Mathf.Clamp01(acumulado / Regras.DuracaoTick);
            visualEu.position = Vector3.Lerp(posAnterior, posAtual, k);
            visualEu.rotation = Quaternion.Euler(0, eu.anguloMira * Mathf.Rad2Deg, 0);
            visualMapa.Atualizar(visualEu.position);
        }

        static Vector3 Posicao3D(EstadoJogador j) => j.posicao.ParaUnity(j.altura + 1f);
    }
}
