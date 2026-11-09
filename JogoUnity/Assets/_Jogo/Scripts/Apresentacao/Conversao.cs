using UnityEngine;

namespace Jogo.Apresentacao
{
    public static class Conversao
    {
        public static Vector3 ParaUnity(this Vetor2 v, float y = 0) => new Vector3(v.x, y, v.z);
        public static Vetor2 ParaChao(this Vector3 v) => new Vetor2(v.x, v.z);
    }
}
