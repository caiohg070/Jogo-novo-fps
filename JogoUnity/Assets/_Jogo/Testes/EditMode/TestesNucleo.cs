using System;
using Jogo.Mapa;
using Jogo.Simulacao;
using NUnit.Framework;

namespace Jogo.Testes
{
    public class TestesNucleo
    {
        [Test]
        public void MesmaSeed_MesmosNumeros()
        {
            var a = new Aleatorio(42); var b = new Aleatorio(42);
            for (int i = 0; i < 1000; i++) Assert.AreEqual(a.ProximoULong(), b.ProximoULong());
        }

        [Test]
        public void ValorFicaEntreZeroEUm()
        {
            var r = new Aleatorio(7);
            for (int i = 0; i < 10000; i++) { float v = r.Valor(); Assert.That(v >= 0f && v < 1f); }
        }

        [Test]
        public void MesmaSeed_MesmoMapa_ForaDeOrdem()
        {
            var g1 = new GeradorMapa(999); var g2 = new GeradorMapa(999);
            g2.Bloco(10, 10); g2.Bloco(3, 4);   // gera outros antes: não pode mudar nada
            for (int cx = 0; cx < Regras.BlocosPorLado; cx += 3)
            for (int cz = 0; cz < Regras.BlocosPorLado; cz += 3)
            {
                var a = g1.Bloco(cx, cz).construcoes; var b = g2.Bloco(cx, cz).construcoes;
                Assert.AreEqual(a.Count, b.Count);
                for (int i = 0; i < a.Count; i++) Assert.AreEqual(a[i].centro, b[i].centro);
            }
            Assert.AreEqual(g1.Altura(123.4f, -56.7f), g2.Altura(123.4f, -56.7f));
        }

        [Test]
        public void SeedsDiferentes_MapasDiferentes()
        {
            Assert.AreNotEqual(new GeradorMapa(1).Altura(10, 10), new GeradorMapa(2).Altura(10, 10));
        }

        [Test]
        public void Morros_RespeitamAlturaEInclinacao()
        {
            var g = new GeradorMapa(2026);
            const float passo = 1f;
            float meio = Regras.TamanhoMapaBR / 2 - 1;
            for (float x = -meio; x < meio; x += 7.3f)
            for (float z = -meio; z < meio; z += 7.3f)
            {
                float h = g.Altura(x, z);
                Assert.That(h >= 0f && h <= Regras.AlturaMaximaMorro + 0.001f, $"altura {h} em {x},{z}");
                float dx = MathF.Abs(g.Altura(x + passo, z) - h), dz = MathF.Abs(g.Altura(x, z + passo) - h);
                Assert.That(dx <= Regras.InclinacaoMaxima && dz <= Regras.InclinacaoMaxima, $"degrau em {x},{z}: {dx:0.00}/{dz:0.00}");
            }
        }

        [Test]
        public void ChaoPlano_EmVoltaDasConstrucoes()
        {
            var g = new GeradorMapa(55);
            int conferidas = 0;
            for (int cx = 0; cx < Regras.BlocosPorLado; cx++)
            for (int cz = 0; cz < Regras.BlocosPorLado; cz++)
                foreach (var c in g.Bloco(cx, cz).construcoes)
                {
                    conferidas++;
                    for (int a = 0; a < 8; a++)
                    {
                        float ang = a * MathF.PI / 4, r = c.Raio + Regras.RaioPlanoEmVoltaPredio * 0.9f;
                        float h = g.Altura(c.centro.x + MathF.Sin(ang) * r, c.centro.z + MathF.Cos(ang) * r);
                        Assert.AreEqual(c.alturaBase, h, 0.05f);
                    }
                }
            Assert.That(conferidas >= 40, $"mapa com poucas construções: {conferidas}");
        }

        [Test]
        public void Construcoes_NaoSeSobrepoem_ENaoPassamDe3Andares()
        {
            var g = new GeradorMapa(77);
            for (int cx = 0; cx < Regras.BlocosPorLado; cx++)
            for (int cz = 0; cz < Regras.BlocosPorLado; cz++)
            {
                var lista = g.Bloco(cx, cz).construcoes;
                for (int i = 0; i < lista.Count; i++)
                {
                    Assert.That(lista[i].andares >= 1 && lista[i].andares <= Regras.AndaresMaximos);
                    for (int j = i + 1; j < lista.Count; j++)
                        Assert.That(Vetor2.Distancia(lista[i].centro, lista[j].centro) > lista[i].Raio + lista[j].Raio);
                }
            }
        }

        [Test]
        public void Servidor_LimitaVelocidade()
        {
            var sim = new Simulador(1);
            var j = sim.Adicionar(0, Vetor2.Zero);
            for (int t = 0; t < Regras.TicksPorSegundo; t++)
            {
                sim.Receber(j.id, new Comando { mover = new Vetor2(50, 0) });   // "trapaça": joystick gigante
                sim.AvancarTick();
            }
            Assert.AreEqual(Regras.VelocidadeAndar, j.posicao.x, 0.01f);
        }
    }
}
