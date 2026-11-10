using Jogo.Nucleo;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.InputSystem;

namespace Jogo.Jogador
{
    /// <summary>
    /// Lê teclado/mouse, controle (Bluetooth) e joysticks de toque (que viram um controle virtual)
    /// e manda um ComandoEntrada por tick. Não mexe no soldado direto: quem decide é o servidor.
    /// Sem mira automática.
    /// </summary>
    [DefaultExecutionOrder(-100)]
    public class EntradaJogador : MonoBehaviour
    {
        public Soldado soldado;
        public InputActionAsset controles;
        [Tooltip("Câmera usada para achar o ponto do mouse no chão")] public Camera cameraJogo;

        /// <summary>Botão "andar" (toggle): metade da velocidade, passos silenciosos.</summary>
        public bool AndarLigado { get; set; }

        InputAction mover, mirar, ponteiro, atirar, devagar, alternarAndar, recarregar, trocarArma;
        InputAction agachar, correr, pular, interagir, granada;
        bool pediuRecarregar, pediuTrocar;
        float ultimoMouse = -99f, ultimoAnalogico = -99f;
        Vector2 ultimaPosMouse;
        Vector2 direcaoMouse; bool temMiraMouse;
        int tick;

        void Awake()
        {
            if (soldado == null) soldado = GetComponent<Soldado>();
            Soldado.Local = soldado;
            var mapa = controles.FindActionMap("Jogador", true);
            mover = mapa.FindAction("Mover", true);
            mirar = mapa.FindAction("MirarAnalogico", true);
            ponteiro = mapa.FindAction("PonteiroMouse", true);
            atirar = mapa.FindAction("Atirar", true);
            devagar = mapa.FindAction("Devagar", true);
            alternarAndar = mapa.FindAction("AlternarAndar", true);
            recarregar = mapa.FindAction("Recarregar", true);
            trocarArma = mapa.FindAction("TrocarArma", true);
            agachar = mapa.FindAction("Agachar", true);
            correr = mapa.FindAction("Correr", true);
            pular = mapa.FindAction("Pular", true);
            interagir = mapa.FindAction("Interagir", true);
            granada = mapa.FindAction("Granada", true);
        }

        void OnEnable() => controles.FindActionMap("Jogador", true).Enable();
        void OnDisable() => controles.FindActionMap("Jogador", true).Disable();

        void Update()
        {
            if (recarregar.WasPressedThisFrame()) pediuRecarregar = true;
            if (trocarArma.WasPressedThisFrame()) pediuTrocar = true;
            if (alternarAndar.WasPressedThisFrame()) AndarLigado = !AndarLigado;

            // qual mira vale: a última usada (mouse ou analógico)
            var mouse = Mouse.current;
            if (mouse != null)
            {
                Vector2 p = ponteiro.ReadValue<Vector2>();
                if ((p - ultimaPosMouse).sqrMagnitude > 4f || mouse.leftButton.wasPressedThisFrame) ultimoMouse = Time.unscaledTime;
                ultimaPosMouse = p;
            }
            if (mirar.ReadValue<Vector2>().sqrMagnitude > 0.01f) ultimoAnalogico = Time.unscaledTime;

            temMiraMouse = false;
            if (mouse != null && cameraJogo != null && soldado != null)
            {
                Ray r = cameraJogo.ScreenPointToRay(ultimaPosMouse);
                var chao = new Plane(Vector3.up, soldado.PosicaoPe);
                if (chao.Raycast(r, out float t))
                {
                    Vector3 alvo = r.GetPoint(t) - soldado.PosicaoPe;
                    var d = new Vector2(alvo.x, alvo.z);
                    if (d.sqrMagnitude > 0.01f) { direcaoMouse = d.normalized; temMiraMouse = true; }
                }
            }
        }

        [Tooltip("Controle físico com cima/baixo invertido (ex.: GameSir em alguns modos). Joysticks de toque não mudam.")]
        public bool inverterVerticalControle = true;

        /// <summary>A ação está vindo de um controle de verdade (não teclado nem joystick de toque)?</summary>
        static bool ControleFisico(InputAction a)
        {
            var d = a.activeControl?.device;
            // joystick de toque cria um controle virtual (não nativo)
            return d != null && !(d is Keyboard) && !(d is Mouse) && d.native;
        }

        void FixedUpdate()
        {
            if (soldado == null || CanalComandos.Atual == null) return;
            var c = new ComandoEntrada { tick = ++tick };
            c.mover = Vector2.ClampMagnitude(mover.ReadValue<Vector2>(), 1f);
            if (inverterVerticalControle && ControleFisico(mover)) c.mover.y = -c.mover.y;
            c.devagar = AndarLigado || devagar.IsPressed();

            float zona = ServidorPartida.Instancia != null ? ServidorPartida.Instancia.regras.zonaMortaMira : 0.28f;
            Vector2 analog = mirar.ReadValue<Vector2>();
            if (inverterVerticalControle && ControleFisico(mirar)) analog.y = -analog.y;
            bool usandoMouse = ultimoMouse > ultimoAnalogico;
            if (analog.magnitude > zona)
            {
                // joystick direito: mira e atira na direção do analógico
                c.temMira = true; c.direcaoMira = analog.normalized; c.gatilho = true;
            }
            else if (usandoMouse && temMiraMouse)
            {
                c.temMira = true; c.direcaoMira = direcaoMouse;
                bool sobreUI = EventSystem.current != null && EventSystem.current.IsPointerOverGameObject();
                c.gatilho = Mouse.current.leftButton.isPressed && !sobreUI;
            }
            if (!c.gatilho && Gamepad.current != null && Gamepad.current.rightTrigger.isPressed) c.gatilho = true;

            c.recarregar = pediuRecarregar; c.trocarArma = pediuTrocar;
            c.agachar = agachar.IsPressed(); c.correr = correr.IsPressed(); c.pular = pular.IsPressed();
            c.interagir = interagir.IsPressed(); c.granada = granada.IsPressed();
            pediuRecarregar = pediuTrocar = false;

            CanalComandos.Atual.Enviar(soldado.Id, c);
        }
    }
}
