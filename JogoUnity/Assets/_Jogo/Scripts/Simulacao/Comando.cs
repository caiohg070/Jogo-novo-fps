using System;

namespace Jogo.Simulacao
{
    [Flags]
    public enum Botoes : ushort
    {
        Nenhum = 0,
        Atirar = 1 << 0,
        Recarregar = 1 << 1,
        Granada = 1 << 2,
        Silencioso = 1 << 3,
        Pular = 1 << 4,
        Interagir = 1 << 5,
        Agachar = 1 << 6,
    }

    /// <summary>
    /// Tudo o que o jogador manda por tick. É SÓ isso que vai pela rede (servidor autoritativo):
    /// nada de posição, vida ou dano vindo do celular. O mesmo comando serve para bots e para o jogador local.
    /// </summary>
    [Serializable]
    public struct Comando
    {
        public uint tick;
        public Vetor2 mover;      // joystick esquerdo, comprimento 0..1
        public float anguloMira;  // radianos, no chão (0 = +z)
        public Botoes botoes;

        public bool Tem(Botoes b) => (botoes & b) != 0;
    }
}
