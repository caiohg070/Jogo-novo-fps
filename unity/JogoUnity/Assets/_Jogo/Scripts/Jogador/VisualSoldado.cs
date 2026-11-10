using System.Collections.Generic;
using Jogo.Nucleo;
using UnityEngine;

namespace Jogo.Jogador
{
    /// <summary>
    /// Aparência do soldado: suaviza entre ticks, vira o corpo, deita ao morrer,
    /// barra de vida e visão justa (inimigo some/aparece com fade).
    /// </summary>
    public class VisualSoldado : MonoBehaviour
    {
        public Soldado soldado;
        [Tooltip("Parte visual (filho). Não pode ter colisores.")] public Transform corpo;
        [Tooltip("Material transparente (URP Lit) usado no fade da visão justa")] public Material materialFantasma;
        [Tooltip("Material sem luz para a barra de vida")] public Material materialBarra;
        public float velocidadeGiro = 18f;
        public float alturaBarra = 2.35f;

        public Vector3 PosicaoVisual => corpo != null ? corpo.position : transform.position;
        public float Opacidade { get; private set; } = 1f;

        Renderer[] renderers;
        Material[] opacos, fantasmas;
        bool usandoFantasma;
        Transform barraFundo, barraVida;
        MaterialPropertyBlock blocoBarra;
        float inclinacao;

        void Awake()
        {
            if (soldado == null) soldado = GetComponent<Soldado>();
            renderers = corpo.GetComponentsInChildren<Renderer>();
            opacos = new Material[renderers.Length];
            for (int i = 0; i < renderers.Length; i++) opacos[i] = renderers[i].sharedMaterial;
            if (materialBarra != null) CriarBarra();
        }

        void CriarBarra()
        {
            blocoBarra = new MaterialPropertyBlock();
            barraFundo = CriarQuad("BarraFundo", new Color(0.1f, 0.08f, 0.06f, 1f), 0.9f, 0.12f);
            barraVida = CriarQuad("BarraVida", new Color(0.45f, 0.82f, 0.35f, 1f), 0.86f, 0.08f);
            barraVida.SetParent(barraFundo, true);
        }

        Transform CriarQuad(string n, Color cor, float largura, float altura)
        {
            var q = GameObject.CreatePrimitive(PrimitiveType.Quad);
            q.name = n;
            Destroy(q.GetComponent<Collider>());
            var r = q.GetComponent<Renderer>();
            r.sharedMaterial = materialBarra;
            r.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
            r.receiveShadows = false;
            blocoBarra.SetColor("_BaseColor", cor);
            r.SetPropertyBlock(blocoBarra);
            q.transform.localScale = new Vector3(largura, altura, 1f);
            q.transform.SetParent(transform, false);
            return q.transform;
        }

        void LateUpdate()
        {
            if (soldado == null || corpo == null) return;
            float dt = Time.deltaTime;

            // interpola entre o tick anterior e o atual (simulação em passo fixo, tela lisa)
            float a = Mathf.Clamp01((Time.time - Time.fixedTime) / Time.fixedDeltaTime);
            corpo.position = Vector3.Lerp(soldado.PosAnterior, soldado.PosAtual, a);

            Vector2 d = soldado.Direcao;
            float alvoY = Mathf.Atan2(d.x, d.y) * Mathf.Rad2Deg;
            float y = Mathf.LerpAngle(corpo.eulerAngles.y, alvoY, Mathf.Min(1f, dt * velocidadeGiro));
            inclinacao = Mathf.Lerp(inclinacao, soldado.Vivo ? 0f : -90f, Mathf.Min(1f, dt * 8f));
            corpo.rotation = Quaternion.Euler(0f, y, 0f) * Quaternion.Euler(inclinacao, 0f, 0f);

            AtualizarVisaoJusta(dt);
            AtualizarBarra();
        }

        void AtualizarVisaoJusta(float dt)
        {
            var local = Soldado.Local;
            var sv = ServidorPartida.Instancia;
            float alvo = 1f;
            if (local != null && local != soldado && local.Equipe != soldado.Equipe && sv != null && sv.dadosCamera != null)
            {
                var cam = Camera.main;
                float aspecto = cam != null ? cam.aspect : 16f / 9f;
                alvo = VisaoJusta.PodeVer(local.PosicaoPe, soldado.PosicaoPe, sv.dadosCamera, aspecto) ? 1f : 0f;
            }
            float fade = sv != null && sv.dadosCamera != null ? sv.dadosCamera.fadeVisao : 0.3f;
            Opacidade = Mathf.MoveTowards(Opacidade, alvo, Mathf.Min(0.1f, dt) / fade);
            AplicarOpacidade(Opacidade);
        }

        void AplicarOpacidade(float op)
        {
            bool visivel = op > 0.001f;
            bool fantasma = visivel && op < 0.999f && materialFantasma != null;
            if (fantasma && fantasmas == null)
            {
                fantasmas = new Material[renderers.Length];
                for (int i = 0; i < renderers.Length; i++)
                {
                    fantasmas[i] = new Material(materialFantasma);
                    if (opacos[i] != null && opacos[i].HasProperty("_BaseColor")) fantasmas[i].SetColor("_BaseColor", opacos[i].GetColor("_BaseColor"));
                }
            }
            for (int i = 0; i < renderers.Length; i++)
            {
                renderers[i].enabled = visivel;
                if (fantasma != usandoFantasma) renderers[i].sharedMaterial = fantasma ? fantasmas[i] : opacos[i];
                if (fantasma)
                {
                    var c = fantasmas[i].GetColor("_BaseColor"); c.a = op; fantasmas[i].SetColor("_BaseColor", c);
                }
            }
            usandoFantasma = fantasma;
        }

        void AtualizarBarra()
        {
            if (barraFundo == null) return;
            var sv = ServidorPartida.Instancia;
            bool mostrar = soldado.Vivo && soldado != Soldado.Local && Opacidade > 0.5f && sv != null;
            barraFundo.gameObject.SetActive(mostrar);
            if (!mostrar) return;
            var cam = Camera.main;
            barraFundo.position = corpo.position + Vector3.up * alturaBarra;
            if (cam != null) barraFundo.rotation = cam.transform.rotation;
            float f = Mathf.Clamp01(soldado.Vida / sv.regras.vidaMax);
            barraVida.localScale = new Vector3(0.95f * f, 0.66f, 1f);
            barraVida.localPosition = new Vector3(-0.475f * (1f - f), 0f, -0.01f);
        }

        void OnDestroy()
        {
            if (fantasmas != null) foreach (var m in fantasmas) Destroy(m);
        }
    }
}
