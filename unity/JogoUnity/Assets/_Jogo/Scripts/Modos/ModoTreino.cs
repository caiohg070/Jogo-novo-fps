using System.Collections;
using System.Collections.Generic;
using Jogo.Jogador;
using UnityEngine;

namespace Jogo.Modos
{
    /// <summary>Cena de treino: quem morre renasce no lugar onde começou depois de alguns segundos.</summary>
    public class ModoTreino : MonoBehaviour
    {
        public ServidorPartida servidor;
        [Tooltip("Alvo de FPS (Android usa 30 se não pedir)")] public int fpsAlvo = 60;
        readonly Dictionary<Soldado, Vector3> inicio = new Dictionary<Soldado, Vector3>();

        void Awake()
        {
            Application.targetFrameRate = fpsAlvo;
            Screen.sleepTimeout = SleepTimeout.NeverSleep; // tela não apaga jogando
        }

        void Start()
        {
            if (servidor == null) servidor = ServidorPartida.Instancia;
            foreach (var s in servidor.Soldados) inicio[s] = s.PosicaoPe;
            servidor.AoMorrer += AoMorrer;
        }

        void OnDestroy() { if (servidor != null) servidor.AoMorrer -= AoMorrer; }

        void AoMorrer(Soldado vitima, Soldado matador) => StartCoroutine(Renascer(vitima));

        IEnumerator Renascer(Soldado s)
        {
            yield return new WaitForSeconds(servidor.regras.tempoRenascer);
            if (s == null) yield break;
            Vector3 p = inicio.TryGetValue(s, out var v) ? v : s.PosicaoPe;
            servidor.Renascer(s, p);
        }
    }
}
