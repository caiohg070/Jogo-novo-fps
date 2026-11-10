using System.Collections;
using Jogo.Cameras;
using Jogo.Jogador;
using Jogo.Nucleo;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;

namespace Jogo.Testes
{
    public class TestesMovimento
    {
        GameObject raiz;

        [TearDown]
        public void Limpar()
        {
            if (raiz != null) Object.Destroy(raiz);
            Soldado.Local = null;
        }

        ServidorPartida CriarServidor()
        {
            raiz = new GameObject("Teste");
            var chao = GameObject.CreatePrimitive(PrimitiveType.Cube);
            chao.transform.SetParent(raiz.transform);
            chao.transform.localScale = new Vector3(100, 1, 100); chao.transform.position = Vector3.down * 0.5f;
            var go = new GameObject("Servidor"); go.SetActive(false); go.transform.SetParent(raiz.transform);
            var sv = go.AddComponent<ServidorPartida>();
            sv.regras = ScriptableObject.CreateInstance<DadosRegras>();
            sv.dadosCamera = ScriptableObject.CreateInstance<DadosCamera>();
            go.SetActive(true);
            return sv;
        }

        Soldado CriarSoldado(Vector3 pos, int equipe, DadosArma arma)
        {
            var go = new GameObject("Soldado"); go.SetActive(false);
            go.transform.SetParent(raiz.transform); go.transform.position = pos;
            go.AddComponent<CharacterController>();
            var s = go.AddComponent<Soldado>();
            s.armasIniciais.Add(arma);
            typeof(Soldado).GetField("equipe", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance).SetValue(s, equipe);
            go.SetActive(true);
            return s;
        }

        [UnityTest]
        public IEnumerator AndaEAtira()
        {
            var sv = CriarServidor();
            var ak = ScriptableObject.CreateInstance<DadosArma>();
            var s = CriarSoldado(Vector3.zero, 0, ak);
            var alvo = CriarSoldado(new Vector3(-20, 0, 8), 1, ak);
            for (int i = 0; i < 10; i++) yield return new WaitForFixedUpdate();

            float x0 = s.PosicaoPe.x;
            int ticks = Mathf.RoundToInt(1f / Time.fixedDeltaTime);
            for (int i = 0; i < ticks; i++)
            {
                sv.ReceberComando(s.Id, new ComandoEntrada { mover = Vector2.right });
                yield return new WaitForFixedUpdate();
            }
            Assert.AreEqual(5f, s.PosicaoPe.x - x0, 0.3f, "1 s a 5 m/s (AK)");
            Assert.AreEqual(Vector2.right, s.Direcao, "sem mira vira para onde anda");

            ak.espalhamento = 0f;
            sv.Renascer(alvo, s.PosicaoPe + new Vector3(0, 0, 8)); // teleporte com o CharacterController desligado
            for (int i = 0; i < 40; i++)
            {
                sv.ReceberComando(s.Id, new ComandoEntrada { temMira = true, direcaoMira = Vector2.up, gatilho = true });
                yield return new WaitForFixedUpdate();
            }
            Assert.Less(alvo.Vida, 100f, "alvo levou dano");
            Assert.Less(s.ArmaAtual.Pente, 30);
            Assert.AreEqual(Vector2.up, s.Direcao, "vira para a mira");
        }

        [UnityTest]
        public IEnumerator CameraSegueComInclinacaoFixa()
        {
            var sv = CriarServidor();
            var s = CriarSoldado(new Vector3(3, 0, 4), 0, ScriptableObject.CreateInstance<DadosArma>());
            Soldado.Local = s;
            var camGo = new GameObject("Cam"); camGo.SetActive(false); camGo.transform.SetParent(raiz.transform);
            var cam = camGo.AddComponent<Camera>();
            var cj = camGo.AddComponent<CameraJogo>(); cj.dados = sv.dadosCamera;
            camGo.SetActive(true);
            for (int i = 0; i < 120; i++) yield return null;
            var d = sv.dadosCamera;
            Vector3 esperado = s.PosicaoPe + d.deslocamento * cj.Escala + Vector3.up * d.alturaAlvo;
            Assert.Less(Vector3.Distance(camGo.transform.position, esperado), 0.2f);
            Assert.AreEqual(38f, cam.fieldOfView, 1e-3);
            Assert.Less(Quaternion.Angle(camGo.transform.rotation, d.Rotacao), 0.01f);
        }
    }
}
