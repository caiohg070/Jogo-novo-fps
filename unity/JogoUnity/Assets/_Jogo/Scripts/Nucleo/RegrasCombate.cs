using UnityEngine;

namespace Jogo.Nucleo
{
    /// <summary>Contas de combate (sem estado): usadas igual offline e no servidor.</summary>
    public static class RegrasCombate
    {
        /// <summary>Espalhamento (radianos para cada lado) do protótipo.</summary>
        public static float Espalhamento(DadosArma arma, DadosRegras regras, bool movendo, bool devagar, bool acessorioMira, float extra = 0f)
        {
            float e;
            if (!movendo) e = arma.espalhamento;
            else if (devagar) e = arma.espalhamento * regras.multEspalhamentoDevagar;
            else e = arma.espalhamentoAndando > 0f ? arma.espalhamentoAndando : arma.espalhamento * regras.multEspalhamentoAndando;
            return (e + extra) * (acessorioMira ? regras.multEspalhamentoAcessorioMira : 1f);
        }

        public static float Velocidade(DadosArma arma, DadosRegras regras, bool atirando, bool devagar)
        {
            float v = arma.velocidade;
            if (atirando && arma.tipo == TipoArma.Fogo) v *= regras.multVelocidadeAtirando;
            if (devagar) v *= regras.multVelocidadeDevagar;
            return v;
        }

        /// <summary>Dano sorteado entre min e max (inclusivo), como randInt do protótipo.</summary>
        public static int SortearDano(DadosArma arma, System.Random sorteio)
            => sorteio.Next(arma.danoMin, arma.danoMax + 1);

        /// <summary>Dano final depois de colete e capacete (estado.js → damage). Devolve dano na vida e o novo colete.</summary>
        public static int DanoFinal(float dano, float penetracao, ref float colete, bool capacete)
        {
            if (colete > 0f)
            {
                float reducao = (1f - penetracao) * 0.5f;
                float noColete = dano * reducao;
                colete = Mathf.Max(0f, Mathf.Round(colete - noColete * 1.2f));
                dano -= noColete;
            }
            if (capacete) dano *= 0.9f;
            return Mathf.RoundToInt(dano);
        }

        /// <summary>Vida depois de um passo de regeneração.</summary>
        public static float Regenerar(float vida, float tempoDesdeDano, float dt, DadosRegras regras)
        {
            if (vida <= 0f || vida >= regras.vidaMax || tempoDesdeDano <= regras.atrasoRegeneracao) return vida;
            return Mathf.Min(regras.vidaMax, vida + regras.regeneracao * dt);
        }

        /// <summary>
        /// Raio (no plano do chão) contra círculo. Devolve a distância até a borda do círculo ou -1 se não acerta.
        /// Mesma conta do shootRay do protótipo.
        /// </summary>
        public static float RaioContraCirculo(Vector2 origem, Vector2 direcao, Vector2 centro, float raio, float alcance)
        {
            Vector2 o = centro - origem;
            float proj = Vector2.Dot(o, direcao);
            if (proj < 0f || proj > alcance) return -1f;
            float perp2 = o.sqrMagnitude - proj * proj;
            if (perp2 > raio * raio) return -1f;
            return Mathf.Max(0.1f, proj - Mathf.Sqrt(raio * raio - perp2));
        }

        public static Vector2 Girar(Vector2 v, float radianos)
        {
            float c = Mathf.Cos(radianos), s = Mathf.Sin(radianos);
            return new Vector2(v.x * c - v.y * s, v.x * s + v.y * c);
        }
    }
}
