using UnityEngine;

namespace Jogo.Nucleo
{
    /// <summary>
    /// O que o jogador quer fazer em um tick. O cliente só manda isto; o servidor (ou o host local)
    /// decide o resultado. Pronto para predição/reconciliação depois (tem número do tick).
    /// Direções no plano do chão: x = direita, y = para cima da tela (+Z do Unity).
    /// </summary>
    public struct ComandoEntrada
    {
        public int tick;
        public Vector2 mover;        // tamanho até 1
        public bool temMira;
        public Vector2 direcaoMira;  // normalizada quando temMira
        public bool gatilho;         // segurando "atirar"
        public bool devagar;         // Shift ou botão "andar" ligado
        public bool recarregar;      // apertou neste tick
        public bool trocarArma;      // apertou neste tick
        public bool agachar, correr, pular, interagir, granada; // reservado (ainda sem efeito)

        public static readonly ComandoEntrada Vazio = default;
    }

    /// <summary>Por onde os comandos chegam ao servidor (host local hoje; rede depois).</summary>
    public interface ICanalComandos
    {
        void Enviar(int idSoldado, in ComandoEntrada comando);
    }
}

namespace Jogo.Nucleo
{
    /// <summary>Canal ativo (o HostLocal se registra aqui; a camada de rede troca depois).</summary>
    public static class CanalComandos
    {
        public static ICanalComandos Atual { get; set; }
    }
}
