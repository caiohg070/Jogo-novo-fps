using UnityEngine;

namespace Jogo.Nucleo
{
    /// <summary>
    /// Câmera do protótipo (Three.js) convertida para o Unity.
    /// No protótipo +Z é "para baixo da tela"; no Unity +Z é "para cima da tela", então o Z troca de sinal.
    /// Protótipo: CAM_OFF = (0, 20.07, 6.06), lookAt (0, 0, 0.68).
    /// </summary>
    [CreateAssetMenu(menuName = "Jogo/Dados da câmera", fileName = "Camera")]
    public class DadosCamera : ScriptableObject
    {
        [Header("Lente")]
        public float fovVertical = 38f;
        public float perto = 0.5f;
        public float longe = 220f;

        [Header("Posição (relativa ao alvo)")]
        public Vector3 deslocamento = new Vector3(0f, 20.07f, -6.06f);
        [Tooltip("Ponto para onde a câmera olha, relativo ao alvo (direção fixa, nunca gira)")]
        public Vector3 pontoOlhar = new Vector3(0f, 0f, -0.68f);
        [Tooltip("Alvo = pé do jogador + isto (meio do corpo no centro da tela)")]
        public float alturaAlvo = 0.9f;

        [Header("Suavização (× dt)")]
        public float seguir = 8f;
        public float seguirKillcam = 4f;
        public float zoomVelocidade = 3f;
        public float lunetaVelocidade = 2f;

        [Header("Escala por proporção de tela")]
        public float escalaRetrato = 1.55f;      // aspecto < 1
        public float escalaQuaseQuadrada = 1.2f; // aspecto < 1,4
        public float escalaUltraLarga = 1.18f;   // aspecto > 1,9

        [Header("Zoom")]
        public float zoomAviao = 1.5f;
        public float zoomParaquedas = 1.35f;
        public float zoomVeiculo = 1.25f;
        public float zoomVeiculoPorVelocidade = 1f / 60f;
        public float zoomLuneta = 0.92f;
        public float zoomAcessorioMira = 1.15f;
        public float zoomMetralhadoraFixa = 1.2f;
        [Tooltip("Sniper mirando: câmera desliza para o lado da mira")]
        public float deslocamentoLuneta = 1f;

        [Header("Killcam (segundos depois de morrer)")]
        public float killcamInicio = 0.5f;
        public float killcamFim = 2.8f;

        [Header("Tremor")]
        public float forcaTremor = 1.2f;

        [Header("Visão justa")]
        [Tooltip("Ponto testado fica a esta altura do pé do alvo")]
        public float alturaPontoVisao = 1f;
        [Tooltip("Segundos para aparecer/sumir")]
        public float fadeVisao = 0.3f;

        public float EscalaPorAspecto(float aspecto)
        {
            if (aspecto < 1f) return escalaRetrato;
            if (aspecto < 1.4f) return escalaQuaseQuadrada;
            if (aspecto > 1.9f) return escalaUltraLarga;
            return 1f;
        }

        /// <summary>Rotação fixa da câmera (≈75° olhando para baixo).</summary>
        public Quaternion Rotacao => Quaternion.LookRotation(pontoOlhar - deslocamento, Vector3.up);
    }
}
