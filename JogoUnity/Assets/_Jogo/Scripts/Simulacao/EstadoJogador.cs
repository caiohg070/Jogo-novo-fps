using System;

namespace Jogo.Simulacao
{
    /// <summary>Estado de um jogador dentro da simulação. A tela só lê isto; quem escreve é o Simulador.</summary>
    [Serializable]
    public class EstadoJogador
    {
        public int id;
        public int time;
        public bool bot;
        public Vetor2 posicao;
        public float altura;      // y do chão onde está
        public float anguloMira;
        public int vida = Regras.VidaMaxima;
        public bool vivo = true;
        public uint ultimoTick;

        public EstadoJogador(int id, int time, Vetor2 posicao, bool bot = false)
        {
            this.id = id; this.time = time; this.posicao = posicao; this.bot = bot;
        }
    }
}
