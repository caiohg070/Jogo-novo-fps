using System;
using System.Collections.Generic;

namespace Jogo.Mapa
{
    /// <summary>
    /// Gera o mapa do Battle Royale a partir de uma seed. Mesma seed = mesmo mapa em todo aparelho e no servidor,
    /// sem baixar nada. Cada bloco é gerado sozinho (não depende da ordem), então dá para gerar aos poucos.
    /// Regras dos morros: altura máx. = altura da casa, sem degraus bruscos, chão plano em volta das construções.
    /// </summary>
    public class GeradorMapa
    {
        public readonly ulong seed;
        readonly Dictionary<long, BlocoMapa> cache = new Dictionary<long, BlocoMapa>();
        readonly Dictionary<long, List<(Construcao c, float prioridade)>> candidatos = new Dictionary<long, List<(Construcao, float)>>();

        const float CelulaGrande = 96f, AlturaGrande = Regras.AlturaMaximaMorro;
        const float CelulaPequena = 24f, AlturaPequena = 0.8f;
        const float Transicao = 20f;   // distância em que o chão plano do prédio vira morro de novo

        public GeradorMapa(ulong seed) { this.seed = seed; }

        public static bool DentroDoMapa(int cx, int cz) =>
            cx >= 0 && cz >= 0 && cx < Regras.BlocosPorLado && cz < Regras.BlocosPorLado;

        public static (int cx, int cz) BlocoEm(float x, float z)
        {
            int cx = (int)MathF.Floor((x + Regras.TamanhoMapaBR / 2) / Regras.TamanhoBloco);
            int cz = (int)MathF.Floor((z + Regras.TamanhoMapaBR / 2) / Regras.TamanhoBloco);
            return (cx, cz);
        }

        public BlocoMapa Bloco(int cx, int cz)
        {
            long chave = ((long)cx << 32) | (uint)cz;
            if (cache.TryGetValue(chave, out var b)) return b;
            b = GerarBloco(cx, cz);
            cache[chave] = b;
            return b;
        }

        // ---------- Terreno ----------

        /// <summary>Altura do morro sem construções (0 até AlturaMaximaMorro).</summary>
        public float AlturaNatural(float x, float z)
        {
            float h = Ruido(x / CelulaGrande, z / CelulaGrande, 1) * AlturaGrande * 0.85f
                    + Ruido(x / CelulaPequena, z / CelulaPequena, 2) * AlturaPequena;
            return Math.Clamp(h, 0f, Regras.AlturaMaximaMorro);
        }

        /// <summary>Altura final do chão, já aplainada em volta das construções.</summary>
        public float Altura(float x, float z)
        {
            float h = AlturaNatural(x, z);
            var (cx, cz) = BlocoEm(x, z);
            // As áreas de transição nunca se sobrepõem (ver Conflita), então no máximo um prédio mexe neste ponto.
            for (int dx = -1; dx <= 1; dx++)
            for (int dz = -1; dz <= 1; dz++)
            {
                if (!DentroDoMapa(cx + dx, cz + dz)) continue;
                foreach (var c in Bloco(cx + dx, cz + dz).construcoes)
                {
                    float d = Vetor2.Distancia(new Vetor2(x, z), c.centro) - (c.Raio + Regras.RaioPlanoEmVoltaPredio);
                    if (d >= Transicao) continue;
                    float t = d <= 0 ? 0 : Suave(d / Transicao);
                    return c.alturaBase + (h - c.alturaBase) * t;
                }
            }
            return h;
        }

        // ---------- Construções ----------

        BlocoMapa GerarBloco(int cx, int cz)
        {
            // Cada bloco sorteia "candidatos" sozinho. Um candidato só vale se não briga com nenhum candidato
            // de prioridade maior (no próprio bloco ou nos vizinhos). Assim o resultado não depende da ordem.
            var bloco = new BlocoMapa(cx, cz);
            foreach (var (c, prio) in Candidatos(cx, cz))
            {
                bool vale = true;
                for (int dx = -2; dx <= 2 && vale; dx++)
                for (int dz = -2; dz <= 2 && vale; dz++)
                {
                    if (!DentroDoMapa(cx + dx, cz + dz)) continue;
                    foreach (var (o, prioO) in Candidatos(cx + dx, cz + dz))
                        if (Ganha(prioO, o, prio, c) && Conflita(c, o)) { vale = false; break; }
                }
                if (vale) bloco.construcoes.Add(c);
            }
            return bloco;
        }

        static bool Ganha(float pa, Construcao a, float pb, Construcao b) =>
            !a.centro.Equals(b.centro) && (pa > pb || (pa == pb && (a.centro.x > b.centro.x || (a.centro.x == b.centro.x && a.centro.z > b.centro.z))));

        /// <summary>Duas construções brigam se as áreas planas + transição delas se encostariam.</summary>
        static bool Conflita(Construcao a, Construcao b) =>
            Vetor2.Distancia(a.centro, b.centro) < a.Raio + b.Raio + 2 * (Regras.RaioPlanoEmVoltaPredio + Transicao);

        List<(Construcao, float)> Candidatos(int cx, int cz)
        {
            long chave = ((long)cx << 32) | (uint)cz;
            if (candidatos.TryGetValue(chave, out var lista)) return lista;
            lista = new List<(Construcao, float)>();
            var r = Aleatorio.Para(seed, cx, cz, 100);
            int quantas = r.Entre(1, 4);
            var origem = new BlocoMapa(cx, cz).Origem;
            for (int i = 0; i < quantas; i++)
            {
                var c = Sortear(ref r);
                float margem = c.Raio + Regras.RaioPlanoEmVoltaPredio;   // prédio + área plana dentro do bloco
                c.centro = new Vetor2(origem.x + r.Entre(margem, Regras.TamanhoBloco - margem),
                                      origem.z + r.Entre(margem, Regras.TamanhoBloco - margem));
                c.alturaBase = AlturaNatural(c.centro.x, c.centro.z);
                lista.Add((c, r.Valor()));
            }
            candidatos[chave] = lista;
            return lista;
        }

        static Construcao Sortear(ref Aleatorio r)
        {
            var c = new Construcao { rotacao90 = r.Entre(0, 4), variante = r.Entre(0, 1000) };
            float p = r.Valor();
            if (p < 0.35f)      { c.tipo = TipoConstrucao.Casa;     c.andares = r.Entre(1, 3); c.largura = r.Entre(8f, 11f); c.profundidade = r.Entre(7f, 10f); }
            else if (p < 0.55f) { c.tipo = TipoConstrucao.Sobrado;  c.andares = 3;             c.largura = r.Entre(7f, 9f);  c.profundidade = r.Entre(7f, 9f); }
            else if (p < 0.75f) { c.tipo = TipoConstrucao.Cabana;   c.andares = 1;             c.largura = r.Entre(4f, 6f);  c.profundidade = r.Entre(4f, 6f); }
            else if (p < 0.92f) { c.tipo = TipoConstrucao.Barracao; c.andares = 1;             c.largura = r.Entre(10f, 14f); c.profundidade = r.Entre(8f, 10f); }
            else                { c.tipo = TipoConstrucao.Bunker;   c.andares = 1;             c.largura = r.Entre(6f, 8f);  c.profundidade = r.Entre(6f, 8f); }
            return c;
        }

        // ---------- Ruído (value noise determinístico, 0..1) ----------

        float Ruido(float x, float z, int camada)
        {
            int x0 = (int)MathF.Floor(x), z0 = (int)MathF.Floor(z);
            float fx = Suave(x - x0), fz = Suave(z - z0);
            float a = Canto(x0, z0, camada), b = Canto(x0 + 1, z0, camada);
            float c = Canto(x0, z0 + 1, camada), d = Canto(x0 + 1, z0 + 1, camada);
            return Lerp(Lerp(a, b, fx), Lerp(c, d, fx), fz);
        }

        float Canto(int x, int z, int camada) => Aleatorio.Para(seed, x, z, camada).Valor();

        static float Suave(float t) => t * t * (3 - 2 * t);
        static float Lerp(float a, float b, float t) => a + (b - a) * t;
    }
}
