using Jogo.Jogador;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.OnScreen;
using UnityEngine.UI;

namespace Jogo.UI
{
    /// <summary>
    /// HUD mínimo montado por código: vida, munição, aviso de morte e controles de toque
    /// (joysticks e botões que viram um controle virtual do Input System).
    /// </summary>
    public class HudMinimo : MonoBehaviour
    {
        public EntradaJogador entrada;
        [Tooltip("Mostrar joysticks mesmo sem tela de toque (teste no PC)")] public bool forcarControlesToque;
        public Vector2 resolucaoReferencia = new Vector2(1920, 1080);

        static readonly Color corPainel = new Color(0.17f, 0.13f, 0.10f, 0.78f);
        static readonly Color corTexto = new Color(0.96f, 0.93f, 0.86f, 1f);
        static readonly Color corVida = new Color(0.45f, 0.82f, 0.35f, 1f);
        static readonly Color corBotao = new Color(1f, 1f, 1f, 0.16f);

        Font fonte;
        Sprite circulo;
        Text textoVida, textoArma, textoPente, textoReserva, textoAviso, textoAndar, textoControle;
        [Tooltip("Mostra no canto o controle conectado e os valores (para testar)")] public bool mostrarControle = true;
        Image barraVida;
        GameObject controlesToque;

        void Start()
        {
            fonte = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            circulo = CriarCirculo(128);
            var canvasGo = new GameObject("HUD", typeof(Canvas), typeof(CanvasScaler), typeof(GraphicRaycaster));
            canvasGo.transform.SetParent(transform, false);
            var canvas = canvasGo.GetComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            var esc = canvasGo.GetComponent<CanvasScaler>();
            esc.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            esc.referenceResolution = resolucaoReferencia;
            esc.matchWidthOrHeight = 0.5f;
            var raiz = (RectTransform)canvasGo.transform;

            // vida (embaixo à esquerda)
            var pv = Painel(raiz, "Vida", new Vector2(0, 0), new Vector2(30, 30), new Vector2(520, 96));
            Rotulo(pv, "+", 64, corVida, new Vector2(20, 0), new Vector2(50, 96), TextAnchor.MiddleLeft);
            textoVida = Rotulo(pv, "100", 60, corTexto, new Vector2(78, 0), new Vector2(140, 96), TextAnchor.MiddleLeft);
            var fundo = Imagem(pv, "BarraFundo", new Color(0, 0, 0, 0.35f), new Vector2(230, 38), new Vector2(260, 20));
            barraVida = Imagem(fundo.rectTransform, "Barra", corVida, Vector2.zero, new Vector2(260, 20));
            barraVida.type = Image.Type.Filled; barraVida.fillMethod = Image.FillMethod.Horizontal;
            barraVida.sprite = CriarQuadrado();

            // munição (embaixo à direita)
            var pm = Painel(raiz, "Municao", new Vector2(1, 0), new Vector2(-30, 30), new Vector2(380, 96));
            textoArma = Rotulo(pm, "AK-47", 34, corTexto, new Vector2(22, 0), new Vector2(150, 96), TextAnchor.MiddleLeft);
            textoPente = Rotulo(pm, "30", 64, corTexto, new Vector2(170, 0), new Vector2(100, 96), TextAnchor.MiddleRight);
            textoReserva = Rotulo(pm, "/ 90", 40, new Color(corTexto.r, corTexto.g, corTexto.b, 0.7f), new Vector2(278, 0), new Vector2(100, 96), TextAnchor.MiddleLeft);

            textoAviso = Rotulo(raiz, "", 70, corTexto, Vector2.zero, new Vector2(900, 120), TextAnchor.MiddleCenter);
            var ra = textoAviso.rectTransform; ra.anchorMin = ra.anchorMax = ra.pivot = new Vector2(0.5f, 0.7f); ra.anchoredPosition = Vector2.zero;
            textoAviso.gameObject.AddComponent<Shadow>().effectDistance = new Vector2(3, -3);

            textoControle = Rotulo(raiz, "", 24, corTexto, Vector2.zero, new Vector2(900, 40), TextAnchor.UpperLeft);
            var rc = textoControle.rectTransform; rc.anchorMin = rc.anchorMax = rc.pivot = new Vector2(0, 1); rc.anchoredPosition = new Vector2(20, -16);
            CriarControlesToque(raiz);
        }

        void CriarControlesToque(RectTransform raiz)
        {
            controlesToque = new GameObject("ControlesToque", typeof(RectTransform));
            var r = (RectTransform)controlesToque.transform;
            r.SetParent(raiz, false); r.anchorMin = Vector2.zero; r.anchorMax = Vector2.one; r.offsetMin = r.offsetMax = Vector2.zero;
            Joystick(r, "JoystickMover", new Vector2(0.21f, 0.33f), "<Gamepad>/leftStick");
            Joystick(r, "JoystickMirar", new Vector2(0.79f, 0.33f), "<Gamepad>/rightStick");
            Botao(r, "RECAR.", new Vector2(0.79f, 0.65f), "<Gamepad>/buttonWest");
            textoAndar = Botao(r, "ANDAR", new Vector2(0.32f, 0.58f), "<Gamepad>/leftStickPress");
            Botao(r, "TROCAR", new Vector2(0.92f, 0.52f), "<Gamepad>/buttonNorth");
            bool toque = Touchscreen.current != null || Application.isMobilePlatform || forcarControlesToque;
            controlesToque.SetActive(toque);
        }

        void Joystick(RectTransform pai, string nome, Vector2 ancora, string caminho)
        {
            var fundo = Imagem(pai, nome, corBotao, Vector2.zero, new Vector2(300, 300));
            fundo.sprite = circulo; fundo.raycastTarget = false;
            var rf = fundo.rectTransform; rf.anchorMin = rf.anchorMax = ancora; rf.pivot = new Vector2(0.5f, 0.5f); rf.anchoredPosition = Vector2.zero;
            var go = new GameObject("Alavanca", typeof(RectTransform), typeof(Image));
            go.SetActive(false); // controlPath precisa estar certo antes do OnEnable
            var ra = (RectTransform)go.transform; ra.SetParent(rf, false); ra.sizeDelta = new Vector2(130, 130);
            var img = go.GetComponent<Image>(); img.sprite = circulo; img.color = new Color(1, 1, 1, 0.35f);
            var stick = go.AddComponent<OnScreenStick>();
            stick.controlPath = caminho; stick.movementRange = 110;
            go.SetActive(true);
        }

        Text Botao(RectTransform pai, string rotulo, Vector2 ancora, string caminho)
        {
            var go = new GameObject("Botao" + rotulo, typeof(RectTransform), typeof(Image));
            go.SetActive(false);
            var rt = (RectTransform)go.transform; rt.SetParent(pai, false);
            rt.anchorMin = rt.anchorMax = ancora; rt.pivot = new Vector2(0.5f, 0.5f); rt.sizeDelta = new Vector2(130, 130);
            var img = go.GetComponent<Image>(); img.sprite = circulo; img.color = corBotao;
            go.AddComponent<OnScreenButton>().controlPath = caminho;
            var t = Rotulo(rt, rotulo, 26, new Color(1, 1, 1, 0.55f), Vector2.zero, new Vector2(130, 130), TextAnchor.MiddleCenter);
            t.raycastTarget = false;
            go.SetActive(true);
            return t;
        }

        void Update()
        {
            var s = Soldado.Local;
            var sv = ServidorPartida.Instancia;
            if (s == null || sv == null || textoVida == null) return;
            textoVida.text = Mathf.CeilToInt(Mathf.Max(0f, s.Vida)).ToString();
            barraVida.fillAmount = Mathf.Clamp01(s.Vida / sv.regras.vidaMax);
            var a = s.ArmaAtual;
            if (a != null)
            {
                textoArma.text = a.dados.nome;
                textoPente.text = a.Recarregando ? "..." : a.Pente.ToString();
                textoReserva.text = "/ " + a.Reserva;
            }
            if (!s.Vivo) textoAviso.text = s.Matador != null && s.Matador != s ? "Abatido por " + s.Matador.nome : "Você morreu";
            else if (a != null && a.Recarregando) textoAviso.text = "";
            else textoAviso.text = "";
            if (textoControle != null)
            {
                var g = Gamepad.current;
                textoControle.text = !mostrarControle ? "" : g == null ? "Controle: nenhum" :
                    $"Controle: {g.displayName}  esq {g.leftStick.ReadValue():F2}  dir {g.rightStick.ReadValue():F2}  {(g.buttonSouth.isPressed ? "B " : "")}{(g.buttonEast.isPressed ? "A " : "")}{(g.rightTrigger.isPressed ? "ZR" : "")}";
            }
            if (textoAndar != null && entrada != null) textoAndar.color = entrada.AndarLigado ? corVida : new Color(1, 1, 1, 0.55f);
        }

        // ---------- montagem ----------
        RectTransform Painel(RectTransform pai, string nome, Vector2 ancora, Vector2 pos, Vector2 tamanho)
        {
            var img = Imagem(pai, nome, corPainel, pos, tamanho);
            var r = img.rectTransform; r.anchorMin = r.anchorMax = r.pivot = ancora; r.anchoredPosition = pos;
            img.raycastTarget = false;
            return r;
        }

        Image Imagem(RectTransform pai, string nome, Color cor, Vector2 pos, Vector2 tamanho)
        {
            var go = new GameObject(nome, typeof(RectTransform), typeof(Image));
            var r = (RectTransform)go.transform; r.SetParent(pai, false);
            r.anchorMin = r.anchorMax = r.pivot = Vector2.zero; r.anchoredPosition = pos; r.sizeDelta = tamanho;
            var img = go.GetComponent<Image>(); img.color = cor; img.raycastTarget = false;
            return img;
        }

        Text Rotulo(RectTransform pai, string texto, int tamanhoFonte, Color cor, Vector2 pos, Vector2 tamanho, TextAnchor alinhamento)
        {
            var go = new GameObject("Texto", typeof(RectTransform), typeof(Text));
            var r = (RectTransform)go.transform; r.SetParent(pai, false);
            r.anchorMin = r.anchorMax = r.pivot = Vector2.zero; r.anchoredPosition = pos; r.sizeDelta = tamanho;
            var t = go.GetComponent<Text>(); t.font = fonte; t.fontSize = tamanhoFonte; t.color = cor; t.alignment = alinhamento;
            t.text = texto; t.raycastTarget = false; t.fontStyle = FontStyle.Bold;
            t.horizontalOverflow = HorizontalWrapMode.Overflow; t.verticalOverflow = VerticalWrapMode.Overflow;
            return t;
        }

        static Sprite CriarCirculo(int n)
        {
            var tex = new Texture2D(n, n, TextureFormat.RGBA32, false);
            float c = (n - 1) * 0.5f;
            for (int y = 0; y < n; y++)
                for (int x = 0; x < n; x++)
                {
                    float d = Mathf.Sqrt((x - c) * (x - c) + (y - c) * (y - c));
                    tex.SetPixel(x, y, new Color(1, 1, 1, Mathf.Clamp01(c - d)));
                }
            tex.Apply();
            return Sprite.Create(tex, new Rect(0, 0, n, n), new Vector2(0.5f, 0.5f));
        }

        static Sprite CriarQuadrado()
        {
            var tex = Texture2D.whiteTexture;
            return Sprite.Create(tex, new Rect(0, 0, tex.width, tex.height), new Vector2(0.5f, 0.5f));
        }
    }
}
