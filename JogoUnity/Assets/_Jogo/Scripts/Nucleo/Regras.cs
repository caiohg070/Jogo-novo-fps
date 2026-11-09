namespace Jogo
{
    /// <summary>
    /// Números fixos do jogo, num lugar só. Vieram do protótipo (utilidades-regras.js) e das decisões do RESPOSTAS_UNITY.md.
    /// O Nucleo não usa UnityEngine: o mesmo código roda no celular e no servidor dedicado.
    /// </summary>
    public static class Regras
    {
        // Simulação (servidor autoritativo): tudo anda em ticks fixos, nunca pelo FPS da tela.
        public const int TicksPorSegundo = 30;
        public const float DuracaoTick = 1f / TicksPorSegundo;

        // Personagem (metros)
        public const float RaioCorpo = 0.42f;      // BODY_R
        public const float RaioAcerto = 0.36f;     // HIT_R
        public const float AlturaTiro = 1.0f;      // SHOT_H
        public const int VidaMaxima = 100;
        public const float VelocidadeAndar = 4.5f;
        public const float VelocidadeSilencioso = 2.2f;

        // Construções
        public const float AlturaAndar = 3.0f;     // FLOOR_H
        public const int AndaresMaximos = 3;

        // Câmera (fixa, quase de cima)
        public const float AnguloCamera = 75f;

        // Mapa do Battle Royale: dividido em blocos, gerado por seed
        public const float TamanhoMapaBR = 800f;
        public const float TamanhoBloco = 50f;
        public const int BlocosPorLado = (int)(TamanhoMapaBR / TamanhoBloco); // 16
        public const float AlturaMaximaMorro = AlturaAndar * 2;              // morro nunca passa da casa
        public const float InclinacaoMaxima = 0.25f;                          // subida máx. por metro (sem degrau brusco)
        public const float RaioPlanoEmVoltaPredio = 8f;                       // terreno suave em volta das construções

        // Partida
        public const int JogadoresMaxBR = 20;
        public const int JogadoresMinBR = 14;
    }
}
