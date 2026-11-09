using System;

namespace Jogo
{
    /// <summary>Posição no chão (x, z). Próprio do Nucleo para não depender da Unity no servidor.</summary>
    [Serializable]
    public struct Vetor2 : IEquatable<Vetor2>
    {
        public float x, z;
        public Vetor2(float x, float z) { this.x = x; this.z = z; }

        public static readonly Vetor2 Zero = new Vetor2(0, 0);
        public float Comprimento => MathF.Sqrt(x * x + z * z);
        public Vetor2 Normalizado { get { float c = Comprimento; return c > 1e-6f ? new Vetor2(x / c, z / c) : Zero; } }

        public static Vetor2 operator +(Vetor2 a, Vetor2 b) => new Vetor2(a.x + b.x, a.z + b.z);
        public static Vetor2 operator -(Vetor2 a, Vetor2 b) => new Vetor2(a.x - b.x, a.z - b.z);
        public static Vetor2 operator *(Vetor2 a, float k) => new Vetor2(a.x * k, a.z * k);
        public static float Distancia(Vetor2 a, Vetor2 b) => (a - b).Comprimento;

        public bool Equals(Vetor2 o) => x == o.x && z == o.z;
        public override bool Equals(object o) => o is Vetor2 v && Equals(v);
        public override int GetHashCode() => HashCode.Combine(x, z);
        public override string ToString() => $"({x:0.##}, {z:0.##})";
    }
}
