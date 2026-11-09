using Jogo.Simulacao;
using UnityEngine;
using UnityEngine.InputSystem;

namespace Jogo.Apresentacao
{
    /// <summary>
    /// Lê teclado/mouse e controle Bluetooth e transforma em Comando. Sem mira automática.
    /// Os botões de toque (joystick estilo do protótipo, configuráveis) entram na etapa 2 e também só geram Comando.
    /// </summary>
    public class EntradaLocal : MonoBehaviour
    {
        public Camera cam;

        public Comando Ler(uint tick, Vector3 posicaoJogador, float anguloAtual)
        {
            var c = new Comando { tick = tick, anguloMira = anguloAtual };
            Vector2 mov = Vector2.zero;
            var tec = Keyboard.current;
            if (tec != null)
            {
                if (tec.wKey.isPressed) mov.y += 1;
                if (tec.sKey.isPressed) mov.y -= 1;
                if (tec.dKey.isPressed) mov.x += 1;
                if (tec.aKey.isPressed) mov.x -= 1;
                if (tec.leftShiftKey.isPressed) c.botoes |= Botoes.Silencioso;
                if (tec.rKey.isPressed) c.botoes |= Botoes.Recarregar;
                if (tec.gKey.isPressed) c.botoes |= Botoes.Granada;
                if (tec.eKey.isPressed) c.botoes |= Botoes.Interagir;
                if (tec.spaceKey.isPressed) c.botoes |= Botoes.Pular;
            }
            var mouse = Mouse.current;
            if (mouse != null && cam != null)
            {
                var raio = cam.ScreenPointToRay(mouse.position.ReadValue());
                var chao = new Plane(Vector3.up, new Vector3(0, posicaoJogador.y + Regras.AlturaTiro, 0));
                if (chao.Raycast(raio, out float d))
                {
                    var alvo = raio.GetPoint(d) - posicaoJogador;
                    if (alvo.sqrMagnitude > 0.01f) c.anguloMira = Mathf.Atan2(alvo.x, alvo.z);
                }
                if (mouse.leftButton.isPressed) c.botoes |= Botoes.Atirar;
            }
            var ctrl = Gamepad.current;
            if (ctrl != null)
            {
                mov += ctrl.leftStick.ReadValue();
                var mira = ctrl.rightStick.ReadValue();
                if (mira.sqrMagnitude > 0.2f)
                {
                    c.anguloMira = Mathf.Atan2(mira.x, mira.y);
                    c.botoes |= Botoes.Atirar;   // igual ao protótipo: arrastar a mira já atira
                }
                if (ctrl.buttonWest.isPressed) c.botoes |= Botoes.Recarregar;
                if (ctrl.rightShoulder.isPressed) c.botoes |= Botoes.Granada;
            }
            mov = Vector2.ClampMagnitude(mov, 1f);
            c.mover = new Vetor2(mov.x, mov.y);
            return c;
        }
    }
}
