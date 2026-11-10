using UnityEngine;

namespace Jogo.Nucleo
{
    /// <summary>Regras do soldado (vida, corpo, movimento, espalhamento). Valores do protótipo.</summary>
    [CreateAssetMenu(menuName = "Jogo/Regras do jogador", fileName = "RegrasJogador")]
    public class DadosRegras : ScriptableObject
    {
        [Header("Vida")]
        public float vidaMax = 100f;
        [Tooltip("Vida por segundo")] public float regeneracao = 12f;
        [Tooltip("Segundos sem dano para começar a regenerar")] public float atrasoRegeneracao = 4f;
        public float curaKit = 45f;

        [Header("Corpo (metros)")]
        public float raioCorpo = 0.42f;
        public float raioAcerto = 0.36f;
        public float alturaTiro = 1.0f;
        public float alturaCorpo = 1.8f;
        public float gravidade = 22f;

        [Header("Movimento")]
        [Tooltip("Atirando com arma de fogo")] public float multVelocidadeAtirando = 0.82f;
        [Tooltip("Andando devagar (Shift / botão andar)")] public float multVelocidadeDevagar = 0.5f;
        [Tooltip("Atraso do 1º tiro (dá tempo de mirar)")] public float atrasoPrimeiroTiro = 0.18f;
        [Tooltip("Analógico de mira: abaixo disso não mira")] public float zonaMortaMira = 0.28f;

        [Header("Espalhamento")]
        public float multEspalhamentoAndando = 1.7f;
        public float multEspalhamentoDevagar = 1.15f;
        public float multEspalhamentoAcessorioMira = 0.8f;
        public float multAlcanceAcessorioMira = 1.25f;

        [Header("Som de passos")]
        public float raioOuvirPassos = 13f;
        public float intervaloPassos = 0.5f;

        [Header("Treino")]
        public float tempoRenascer = 3f;
    }
}
