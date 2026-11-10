using Jogo.Jogador;
using Jogo.Nucleo;
using UnityEngine;

namespace Jogo.Rede
{
    /// <summary>
    /// Modo offline: o "servidor" roda nesta mesma máquina e os comandos vão direto para ele.
    /// A versão online (Netcode for GameObjects + servidor dedicado) vai implementar o mesmo ICanalComandos.
    /// </summary>
    [DefaultExecutionOrder(-150)]
    public class HostLocal : MonoBehaviour, ICanalComandos
    {
        public ServidorPartida servidor;

        void Awake()
        {
            if (servidor == null) servidor = GetComponent<ServidorPartida>();
            CanalComandos.Atual = this;
        }

        void OnDestroy() { if (ReferenceEquals(CanalComandos.Atual, this)) CanalComandos.Atual = null; }

        public void Enviar(int idSoldado, in ComandoEntrada comando) => servidor.ReceberComando(idSoldado, comando);
    }
}
