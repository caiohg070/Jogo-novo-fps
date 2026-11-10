using Jogo.Jogador;
using Jogo.Nucleo;
using UnityEngine;

namespace Jogo.Bots
{
    /// <summary>
    /// Bot de treino: fica parado (ou anda de um lado para o outro) e só recebe dano.
    /// Manda comandos pelo mesmo canal do jogador: o servidor trata todos igual.
    /// </summary>
    [DefaultExecutionOrder(-100)]
    public class BotAlvo : MonoBehaviour
    {
        public Soldado soldado;
        [Tooltip("0 = parado. Senão anda de um lado para o outro por esta distância (m)")]
        public float vaiEVem = 0f;
        [Tooltip("Andar devagar (metade da velocidade)")] public bool devagar = true;

        Vector3 inicio;
        float sentido = 1f;

        void Awake()
        {
            if (soldado == null) soldado = GetComponent<Soldado>();
            inicio = transform.position;
        }

        void FixedUpdate()
        {
            if (soldado == null || CanalComandos.Atual == null) return;
            var c = new ComandoEntrada();
            if (vaiEVem > 0f && soldado.Vivo)
            {
                float x = soldado.PosicaoPe.x - inicio.x;
                if (x > vaiEVem * 0.5f) sentido = -1f; else if (x < -vaiEVem * 0.5f) sentido = 1f;
                c.mover = new Vector2(sentido, 0f);
                c.devagar = devagar;
            }
            CanalComandos.Atual.Enviar(soldado.Id, c);
        }
    }
}
