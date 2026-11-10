using System.Collections.Generic;
using Jogo.Armas;
using UnityEngine;

namespace Jogo.Jogador
{
    /// <summary>Traçantes dos tiros (só aparência). Ouve os eventos do servidor.</summary>
    public class EfeitosTiro : MonoBehaviour
    {
        public Material materialTracante;
        public Color corTracante = new Color(1f, 0.85f, 0.5f, 1f);
        public float duracao = 0.07f;
        public float largura = 0.04f;

        class Tracante { public LineRenderer linha; public float resta; }
        readonly List<Tracante> ativos = new List<Tracante>();
        readonly Stack<LineRenderer> livres = new Stack<LineRenderer>();
        ServidorPartida servidor;

        void OnEnable()
        {
            servidor = ServidorPartida.Instancia;
            if (servidor != null) servidor.AoDisparar += AoDisparar;
        }

        void OnDisable() { if (servidor != null) servidor.AoDisparar -= AoDisparar; }

        void AoDisparar(Soldado quem, ResultadoTiro r)
        {
            // visão justa: tiro de quem eu não vejo não aparece
            var vis = quem.GetComponent<VisualSoldado>();
            if (vis != null && vis.Opacidade < 0.5f) return;
            var l = livres.Count > 0 ? livres.Pop() : Criar();
            l.gameObject.SetActive(true);
            l.SetPosition(0, r.inicio + (r.fim - r.inicio).normalized * 0.7f);
            l.SetPosition(1, r.fim);
            ativos.Add(new Tracante { linha = l, resta = duracao });
        }

        LineRenderer Criar()
        {
            var go = new GameObject("Tracante");
            go.transform.SetParent(transform, false);
            var l = go.AddComponent<LineRenderer>();
            l.positionCount = 2; l.useWorldSpace = true; l.widthMultiplier = largura;
            l.sharedMaterial = materialTracante;
            l.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off; l.receiveShadows = false;
            return l;
        }

        void Update()
        {
            for (int i = ativos.Count - 1; i >= 0; i--)
            {
                var t = ativos[i];
                t.resta -= Time.deltaTime;
                if (t.resta <= 0f) { t.linha.gameObject.SetActive(false); livres.Push(t.linha); ativos.RemoveAt(i); continue; }
                float a = t.resta / duracao;
                var c0 = corTracante; c0.a = 0.15f * a; var c1 = corTracante; c1.a = a;
                t.linha.startColor = c0; t.linha.endColor = c1;
            }
        }
    }
}
