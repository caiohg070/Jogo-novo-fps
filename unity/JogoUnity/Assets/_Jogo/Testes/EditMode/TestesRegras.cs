using Jogo.Armas;
using Jogo.Nucleo;
using NUnit.Framework;
using UnityEngine;

namespace Jogo.Testes
{
    public class TestesRegras
    {
        DadosArma ak; DadosArma awm; DadosRegras regras; DadosCamera cam;

        [SetUp]
        public void Preparar()
        {
            ak = ScriptableObject.CreateInstance<DadosArma>(); // valores padrão = AK-47
            awm = ScriptableObject.CreateInstance<DadosArma>();
            awm.espalhamento = 0.002f; awm.espalhamentoAndando = 0.14f; awm.luneta = true; awm.pente = 5; awm.reserva = 20;
            regras = ScriptableObject.CreateInstance<DadosRegras>();
            cam = ScriptableObject.CreateInstance<DadosCamera>();
        }

        [Test]
        public void Espalhamento_SegueOPrototipo()
        {
            Assert.AreEqual(0.03f, RegrasCombate.Espalhamento(ak, regras, false, false, false), 1e-6);
            Assert.AreEqual(0.03f * 1.7f, RegrasCombate.Espalhamento(ak, regras, true, false, false), 1e-6);
            Assert.AreEqual(0.03f * 1.15f, RegrasCombate.Espalhamento(ak, regras, true, true, false), 1e-6);
            Assert.AreEqual(0.03f * 0.8f, RegrasCombate.Espalhamento(ak, regras, false, false, true), 1e-6);
            Assert.AreEqual(0.14f, RegrasCombate.Espalhamento(awm, regras, true, false, false), 1e-6);
        }

        [Test]
        public void Velocidade_AtirandoEDevagar()
        {
            Assert.AreEqual(5f, RegrasCombate.Velocidade(ak, regras, false, false), 1e-5);
            Assert.AreEqual(5f * 0.82f, RegrasCombate.Velocidade(ak, regras, true, false), 1e-5);
            Assert.AreEqual(5f * 0.82f * 0.5f, RegrasCombate.Velocidade(ak, regras, true, true), 1e-5);
        }

        [Test]
        public void Dano_SorteadoNoIntervalo()
        {
            var r = new System.Random(1);
            for (int i = 0; i < 500; i++) Assert.That(RegrasCombate.SortearDano(ak, r), Is.InRange(27, 36));
        }

        [Test]
        public void Dano_ColeteECapacete()
        {
            float colete = 0f;
            Assert.AreEqual(30, RegrasCombate.DanoFinal(30, 0.55f, ref colete, false));
            colete = 100f;
            int d = RegrasCombate.DanoFinal(30, 0.5f, ref colete, true); // (30 - 7,5) × 0,9 = 20,25
            Assert.AreEqual(20, d);
            Assert.AreEqual(91f, colete); // 100 - 7,5 × 1,2
        }

        [Test]
        public void Regeneracao_So4sDepoisDoDano()
        {
            Assert.AreEqual(50f, RegrasCombate.Regenerar(50f, 3.9f, 1f, regras));
            Assert.AreEqual(62f, RegrasCombate.Regenerar(50f, 4.1f, 1f, regras), 1e-4);
            Assert.AreEqual(100f, RegrasCombate.Regenerar(95f, 10f, 1f, regras));
            Assert.AreEqual(0f, RegrasCombate.Regenerar(0f, 10f, 1f, regras));
        }

        [Test]
        public void RaioContraCirculo()
        {
            float d = RegrasCombate.RaioContraCirculo(Vector2.zero, Vector2.up, new Vector2(0, 10), 0.36f, 32);
            Assert.AreEqual(10f - 0.36f, d, 1e-4);
            Assert.Less(RegrasCombate.RaioContraCirculo(Vector2.zero, Vector2.up, new Vector2(0.5f, 10), 0.36f, 32), 0f);
            Assert.Less(RegrasCombate.RaioContraCirculo(Vector2.zero, Vector2.up, new Vector2(0, -5), 0.36f, 32), 0f);
            Assert.Less(RegrasCombate.RaioContraCirculo(Vector2.zero, Vector2.up, new Vector2(0, 40), 0.36f, 32), 0f);
        }

        [Test]
        public void Arma_MunicaoERecarga()
        {
            var e = new EstadoArma(ak);
            for (int i = 0; i < 30; i++) { Assert.IsTrue(e.Disparar(), "tiro " + i); e.Tick(0.1f); }
            Assert.AreEqual(0, e.Pente);
            Assert.IsTrue(e.Recarregando, "pente vazio recarrega sozinho");
            Assert.IsFalse(e.Disparar());
            e.Tick(2.41f);
            Assert.AreEqual(30, e.Pente); Assert.AreEqual(60, e.Reserva);
        }

        [Test]
        public void Arma_Cadencia()
        {
            var e = new EstadoArma(ak);
            Assert.IsTrue(e.Disparar());
            Assert.IsFalse(e.Disparar());
            e.Tick(0.05f); Assert.IsFalse(e.Disparar());
            e.Tick(0.05f); Assert.IsTrue(e.Disparar());
        }

        [Test]
        public void Camera_EscalaPorAspecto()
        {
            Assert.AreEqual(1.55f, cam.EscalaPorAspecto(0.5f));
            Assert.AreEqual(1.2f, cam.EscalaPorAspecto(1.3f));
            Assert.AreEqual(1f, cam.EscalaPorAspecto(16f / 9f));
            Assert.AreEqual(1.18f, cam.EscalaPorAspecto(2.2f));
        }

        [Test]
        public void Camera_Inclinacao75Graus()
        {
            Vector3 f = cam.Rotacao * Vector3.forward;
            float ang = Mathf.Atan2(-f.y, f.z) * Mathf.Rad2Deg;
            Assert.AreEqual(75f, ang, 0.5f);
            Assert.AreEqual(0f, f.x, 1e-5);
        }

        [Test]
        public void VisaoJusta_Simetrica()
        {
            float asp = 16f / 9f;
            Assert.IsTrue(VisaoJusta.PodeVer(Vector3.zero, new Vector3(0, 0, 5), cam, asp));
            Assert.IsTrue(VisaoJusta.PodeVer(Vector3.zero, new Vector3(10, 0, 0), cam, asp));
            Assert.IsFalse(VisaoJusta.PodeVer(Vector3.zero, new Vector3(40, 0, 0), cam, asp));
            var r = new System.Random(3);
            for (int i = 0; i < 300; i++)
            {
                var a = new Vector3((float)r.NextDouble() * 40 - 20, 0, (float)r.NextDouble() * 40 - 20);
                var b = new Vector3((float)r.NextDouble() * 40 - 20, 0, (float)r.NextDouble() * 40 - 20);
                Assert.AreEqual(VisaoJusta.PodeVer(a, b, cam, asp), VisaoJusta.PodeVer(b, a, cam, asp));
            }
        }

        [Test]
        public void VisaoJusta_EscondeFaixaQueSoUmLadoVeria()
        {
            // perspectiva: a parte de cima da tela é mais larga que a de baixo. Os cantos de cima
            // (que o outro não veria) ficam escondidos; o centro de cima e de baixo vale igual.
            float asp = 16f / 9f;
            int naTela = 0, escondidos = 0, escondidosEmCima = 0;
            for (float x = -20; x <= 20; x += 0.25f)
                for (float z = -12; z <= 12; z += 0.25f)
                {
                    var p = new Vector3(x, 0, z);
                    if (!VisaoJusta.NaTelaBase(p, cam, asp)) continue;
                    naTela++;
                    if (VisaoJusta.PodeVer(Vector3.zero, p, cam, asp)) continue;
                    escondidos++;
                    if (z > 0) escondidosEmCima++;
                }
            Assert.Greater(escondidos, 0);
            Assert.AreEqual(escondidos, escondidosEmCima, "só esconde a faixa de cima");
            float fracao = escondidos / (float)naTela;
            Assert.That(fracao, Is.InRange(0.03f, 0.2f), "faixa dos cantos de cima ~9% da tela (área no chão)");
            Debug.Log($"Visão justa: {fracao:P1} da área visível no chão fica escondida");
        }
    }
}
