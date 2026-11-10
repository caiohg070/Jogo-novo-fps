using Jogo.Armas;
using Jogo.Jogador;
using Jogo.Nucleo;
using UnityEngine;

namespace Jogo.Cameras
{
    /// <summary>
    /// Câmera do protótipo: fixa (nunca gira), FOV 38°, segue o jogador com suavização,
    /// escala por proporção de tela, zoom, deslize da luneta, tremor e killcam.
    /// </summary>
    [RequireComponent(typeof(UnityEngine.Camera))]
    public class CameraJogo : MonoBehaviour
    {
        public DadosCamera dados;
        [Tooltip("Zoom forçado por outro sistema (avião, veículo...). 0 = automático")]
        public float zoomForcado = 0f;
        [Tooltip("Acessório de mira equipado (zoom 1,15)")] public bool acessorioMira;

        public float Escala { get; private set; } = 1f;
        public float Zoom { get; private set; } = 1f;

        UnityEngine.Camera cam;
        Vector3 alvo, deslocLuneta;
        float tremor;
        bool iniciado;
        ServidorPartida servidor;
        readonly System.Random sorteio = new System.Random();

        void Awake()
        {
            cam = GetComponent<UnityEngine.Camera>();
            Aplicarlente();
        }

        void Aplicarlente()
        {
            cam.fieldOfView = dados.fovVertical;
            cam.nearClipPlane = dados.perto;
            cam.farClipPlane = dados.longe;
            transform.rotation = dados.Rotacao;
        }

        void OnEnable()
        {
            servidor = ServidorPartida.Instancia;
            if (servidor != null) servidor.AoDisparar += AoDisparar;
        }

        void OnDisable() { if (servidor != null) servidor.AoDisparar -= AoDisparar; }

        /// <summary>Tremor de tela (explosão, sniper, escopeta).</summary>
        public void Tremer(float segundos) => tremor = Mathf.Max(tremor, segundos);

        void AoDisparar(Soldado quem, ResultadoTiro r)
        {
            if (quem != Soldado.Local) return;
            var d = quem.ArmaAtual?.dados;
            if (d != null && (d.luneta || d.chumbos > 1)) Tremer(0.12f);
        }

        Soldado AlvoKillcam(Soldado local)
        {
            if (local.Vivo || local.Matador == null || local.Matador == local || servidor == null) return null;
            float t = servidor.Tempo - local.TempoMorte;
            return t > dados.killcamInicio && t < dados.killcamFim ? local.Matador : null;
        }

        void LateUpdate()
        {
            var local = Soldado.Local;
            if (local == null) return;
            float dt = Time.deltaTime;
            Aplicarlente();
            Escala = dados.EscalaPorAspecto(cam.aspect);

            var kc = AlvoKillcam(local);
            var seguido = kc != null ? kc : local;
            var vis = seguido.GetComponent<VisualSoldado>();
            Vector3 p = vis != null ? vis.PosicaoVisual : seguido.PosicaoPe;
            if (!iniciado) { alvo = p; iniciado = true; }
            alvo = Vector3.Lerp(alvo, p, Mathf.Min(1f, dt * (kc != null ? dados.seguirKillcam : dados.seguir)));

            bool luneta = kc == null && local.Vivo && local.MirandoLuneta;
            float zAlvo = zoomForcado > 0f ? zoomForcado : luneta ? dados.zoomLuneta : local.Vivo && acessorioMira ? dados.zoomAcessorioMira : 1f;
            Zoom = Mathf.Lerp(Zoom, zAlvo, Mathf.Min(1f, dt * dados.zoomVelocidade));

            Vector2 d = local.Direcao;
            Vector3 dl = luneta ? new Vector3(d.x, 0f, d.y) * dados.deslocamentoLuneta : Vector3.zero;
            deslocLuneta = Vector3.Lerp(deslocLuneta, dl, Mathf.Min(1f, dt * dados.lunetaVelocidade));

            Vector3 pos = alvo + deslocLuneta + dados.deslocamento * (Escala * Zoom) + Vector3.up * dados.alturaAlvo;
            if (tremor > 0f)
            {
                tremor -= dt;
                float f = Mathf.Max(0f, tremor) * dados.forcaTremor;
                pos.x += ((float)sorteio.NextDouble() * 2f - 1f) * f;
                pos.z += ((float)sorteio.NextDouble() * 2f - 1f) * f;
            }
            transform.position = pos;
        }
    }
}
