namespace Jogo
{
    /// <summary>
    /// Sorteio determinístico: mesma seed = mesmos números em qualquer aparelho e no servidor.
    /// Nunca usar UnityEngine.Random nem System.Random para coisas da partida (mapa, loot, zona).
    /// </summary>
    public struct Aleatorio
    {
        ulong estado;

        public Aleatorio(ulong seed) { estado = Misturar(seed + 0x9E3779B97F4A7C15UL); if (estado == 0) estado = 1; }

        /// <summary>Gerador próprio para um pedaço do mapa (ex.: bloco cx,cz), sem depender da ordem de geração.</summary>
        public static Aleatorio Para(ulong seed, int a, int b = 0, int c = 0)
        {
            ulong h = seed;
            h = Misturar(h ^ (uint)a);
            h = Misturar(h ^ ((ulong)(uint)b << 32));
            h = Misturar(h ^ (uint)c * 0x85EBCA6BUL);
            return new Aleatorio(h);
        }

        public static ulong Misturar(ulong z)   // SplitMix64
        {
            z += 0x9E3779B97F4A7C15UL;
            z = (z ^ (z >> 30)) * 0xBF58476D1CE4E5B9UL;
            z = (z ^ (z >> 27)) * 0x94D049BB133111EBUL;
            return z ^ (z >> 31);
        }

        public ulong ProximoULong()   // xorshift64*
        {
            estado ^= estado >> 12; estado ^= estado << 25; estado ^= estado >> 27;
            return estado * 2685821657736338717UL;
        }

        /// <summary>Número entre 0 (incluso) e 1 (excluso).</summary>
        public float Valor() => (ProximoULong() >> 40) / 16777216f;

        public float Entre(float min, float max) => min + (max - min) * Valor();

        /// <summary>Inteiro entre min (incluso) e max (excluso).</summary>
        public int Entre(int min, int max) => max <= min ? min : min + (int)(ProximoULong() % (ulong)(max - min));

        public bool Chance(float p) => Valor() < p;
    }
}
