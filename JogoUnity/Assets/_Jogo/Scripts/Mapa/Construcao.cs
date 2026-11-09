using System;

namespace Jogo.Mapa
{
    public enum TipoConstrucao : byte { Casa, Sobrado, Barracao, Bunker, Cabana }

    /// <summary>Uma construção sorteada no mapa. A forma real (paredes, portas) sai de um "kit" de peças na etapa de visual.</summary>
    [Serializable]
    public struct Construcao
    {
        public TipoConstrucao tipo;
        public Vetor2 centro;
        public float largura, profundidade;
        public int rotacao90;     // 0..3 (só ângulos retos: colisão e tiro ficam simples e justos)
        public int andares;
        public float alturaBase;  // chão da construção (terreno é aplainado em volta)
        public int variante;      // muda a forma interna (cômodos, portas) com a mesma seed

        public float Raio => 0.5f * MathF.Sqrt(largura * largura + profundidade * profundidade);
    }
}
