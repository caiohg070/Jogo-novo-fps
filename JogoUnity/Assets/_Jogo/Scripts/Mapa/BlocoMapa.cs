using System.Collections.Generic;

namespace Jogo.Mapa
{
    /// <summary>Pedaço de 50×50 m do mapa. Só os blocos perto do jogador ficam carregados na tela.</summary>
    public class BlocoMapa
    {
        public readonly int cx, cz;
        public readonly List<Construcao> construcoes = new List<Construcao>();

        public BlocoMapa(int cx, int cz) { this.cx = cx; this.cz = cz; }

        /// <summary>Canto (x mínimo, z mínimo) do bloco em metros.</summary>
        public Vetor2 Origem => new Vetor2(cx * Regras.TamanhoBloco - Regras.TamanhoMapaBR / 2,
                                           cz * Regras.TamanhoBloco - Regras.TamanhoMapaBR / 2);
    }
}
