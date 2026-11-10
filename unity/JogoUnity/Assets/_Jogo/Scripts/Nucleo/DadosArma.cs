using UnityEngine;

namespace Jogo.Nucleo
{
    public enum TipoArma { Fogo, Corpo }
    public enum SlotArma { Primaria, Secundaria, Faca }

    /// <summary>Números de uma arma. Nunca colocar esses valores fixos no código.</summary>
    [CreateAssetMenu(menuName = "Jogo/Dados da arma", fileName = "Arma")]
    public class DadosArma : ScriptableObject
    {
        public string nome = "Arma";
        public TipoArma tipo = TipoArma.Fogo;
        public SlotArma slot = SlotArma.Primaria;

        [Header("Munição")]
        public int pente = 30;
        public int reserva = 90;
        [Tooltip("Segundos entre tiros")] public float cadencia = 0.1f;
        [Tooltip("Segundos para recarregar")] public float recarga = 2.4f;

        [Header("Dano")]
        public int danoMin = 27;
        public int danoMax = 36;
        [Tooltip("Chumbos por tiro (escopeta). 1 = bala normal")] public int chumbos = 1;
        [Tooltip("0..1: quanto atravessa colete")] public float penetracao = 0.55f;

        [Header("Precisão e alcance")]
        [Tooltip("Espalhamento parado (radianos para cada lado)")] public float espalhamento = 0.03f;
        [Tooltip("Espalhamento andando. 0 = usar espalhamento × multiplicador das regras")] public float espalhamentoAndando = 0f;
        [Tooltip("Metros")] public float alcance = 32f;

        [Header("Jogador")]
        [Tooltip("Velocidade de quem carrega a arma (m/s)")] public float velocidade = 5f;
        [Tooltip("Sniper: segurar = mirar, soltar = atirar")] public bool luneta;
    }
}
