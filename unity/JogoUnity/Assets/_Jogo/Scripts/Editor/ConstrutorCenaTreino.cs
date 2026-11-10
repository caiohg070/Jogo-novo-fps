using System.Collections.Generic;
using Jogo.Bots;
using Jogo.Cameras;
using Jogo.Jogador;
using Jogo.Modos;
using Jogo.Nucleo;
using Jogo.Rede;
using Jogo.UI;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.UI;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Jogo.Editor
{
    /// <summary>
    /// Cria (ou recria) os dados, materiais, o prefab do soldado e a cena de treino em greybox.
    /// Menu: Jogo > Recriar cena de treino. Dados que já existem NÃO são sobrescritos (ajustes ficam).
    /// </summary>
    public static class ConstrutorCenaTreino
    {
        const string Raiz = "Assets/_Jogo";
        const string CaminhoCena = Raiz + "/Cenas/Treino.unity";

        // cores do guia de estilo (greybox)
        static readonly Color CorChao = new Color(0.66f, 0.47f, 0.29f);
        static readonly Color CorFundo = new Color(0.80f, 0.71f, 0.57f);
        static readonly Color CorMadeira = new Color(0.55f, 0.38f, 0.22f);
        static readonly Color CorConcreto = new Color(0.72f, 0.70f, 0.66f);
        static readonly Color CorOliva = new Color(0.33f, 0.37f, 0.20f);
        static readonly Color CorAreia = new Color(0.72f, 0.62f, 0.42f);
        static readonly Color CorJogador = new Color(0.25f, 0.45f, 0.75f);
        static readonly Color CorInimigo = new Color(0.72f, 0.24f, 0.18f);
        static readonly Color CorEscuro = new Color(0.12f, 0.11f, 0.10f);

        [MenuItem("Jogo/Recriar cena de treino")]
        public static void Construir()
        {
            Pasta(Raiz + "/Dados/Armas"); Pasta(Raiz + "/Materiais"); Pasta(Raiz + "/Prefabs"); Pasta(Raiz + "/Cenas");

            var regras = Dado<DadosRegras>(Raiz + "/Dados/RegrasJogador.asset", null);
            var dadosCam = Dado<DadosCamera>(Raiz + "/Dados/Camera.asset", null);
            var armas = CriarArmas();

            var mats = new Dictionary<string, Material>
            {
                ["Chao"] = Lit("Chao", CorChao), ["Madeira"] = Lit("Madeira", CorMadeira), ["Concreto"] = Lit("Concreto", CorConcreto),
                ["Oliva"] = Lit("Oliva", CorOliva), ["Areia"] = Lit("SacoAreia", CorAreia), ["Jogador"] = Lit("SoldadoAzul", CorJogador),
                ["Inimigo"] = Lit("SoldadoVermelho", CorInimigo), ["Escuro"] = Lit("Escuro", CorEscuro),
            };
            var fantasma = LitTransparente("Fantasma");
            var barra = Mat("Barra", "Universal Render Pipeline/Unlit", Color.white);
            var linha = Mat("Linha", "Sprites/Default", Color.white);

            var prefab = CriarPrefabSoldado(mats["Jogador"], mats["Escuro"], fantasma, barra);

            var cena = EditorSceneManager.NewScene(NewSceneSetup.EmptyScene, NewSceneMode.Single);
            Iluminacao();

            // servidor (host local)
            var sv = new GameObject("Servidor");
            var servidor = sv.AddComponent<ServidorPartida>();
            servidor.regras = regras; servidor.dadosCamera = dadosCam;
            sv.AddComponent<HostLocal>().servidor = servidor;
            sv.AddComponent<ModoTreino>().servidor = servidor;
            sv.AddComponent<EfeitosTiro>().materialTracante = linha;

            Cenario(mats);

            // câmera
            var camGo = new GameObject("Main Camera") { tag = "MainCamera" };
            var cam = camGo.AddComponent<UnityEngine.Camera>();
            cam.clearFlags = CameraClearFlags.SolidColor; cam.backgroundColor = CorFundo;
            camGo.AddComponent<AudioListener>();
            cam.GetUniversalAdditionalCameraData().renderPostProcessing = true;
            PosProcesso();
            var cj = camGo.AddComponent<CameraJogo>(); cj.dados = dadosCam;
            cam.fieldOfView = dadosCam.fovVertical; cam.nearClipPlane = dadosCam.perto; cam.farClipPlane = dadosCam.longe;
            camGo.transform.SetPositionAndRotation(dadosCam.deslocamento + Vector3.up * dadosCam.alturaAlvo, dadosCam.Rotacao);

            // jogador
            var jog = CriarSoldado(prefab, "Jogador", "Você", 0, Vector3.zero, new[] { armas["AK47"], armas["AWM"], armas["P92"] }, null);
            var ent = jog.AddComponent<EntradaJogador>();
            ent.soldado = jog.GetComponent<Soldado>();
            ent.controles = AssetDatabase.LoadAssetAtPath<InputActionAsset>(Raiz + "/Dados/ControlesJogo.inputactions");
            ent.cameraJogo = cam;
            var lm = new GameObject("LinhaMira", typeof(LineRenderer));
            lm.transform.SetParent(jog.transform, false);
            lm.GetComponent<LineRenderer>().sharedMaterial = linha;
            lm.AddComponent<LinhaMira>().visual = jog.GetComponent<VisualSoldado>();

            // bots de treino
            Bot(prefab, mats["Inimigo"], "Bot parado", new Vector3(0, 0, 7), 0f, armas["AK47"]);
            Bot(prefab, mats["Inimigo"], "Bot andando", new Vector3(-7, 0, 3), 6f, armas["AK47"]);
            Bot(prefab, mats["Inimigo"], "Bot longe", new Vector3(4, 0, 12.5f), 0f, armas["AK47"]);
            Bot(prefab, mats["Inimigo"], "Bot atrás da parede", new Vector3(9, 0, -3), 0f, armas["AK47"]);

            // HUD
            var hud = new GameObject("HUD");
            hud.AddComponent<HudMinimo>().entrada = ent;
            var es = new GameObject("EventSystem", typeof(UnityEngine.EventSystems.EventSystem));
            es.AddComponent<InputSystemUIInputModule>();

            EditorSceneManager.SaveScene(cena, CaminhoCena);
            var lista = new List<EditorBuildSettingsScene>(EditorBuildSettings.scenes);
            lista.RemoveAll(s => s.path == CaminhoCena);
            lista.Insert(0, new EditorBuildSettingsScene(CaminhoCena, true));
            EditorBuildSettings.scenes = lista.ToArray();
            AssetDatabase.SaveAssets();
            Debug.Log("Cena de treino criada em " + CaminhoCena);
        }

        // ---------------- dados ----------------
        static Dictionary<string, DadosArma> CriarArmas()
        {
            var d = new Dictionary<string, DadosArma>();
            // nome, pente, reserva, cadência, dano, chumbos, espalhamento, andando, alcance, recarga, velocidade, pen, luneta, slot, tipo
            d["AK47"] = Arma("AK47", "AK-47", 30, 90, 0.1f, 27, 36, 1, 0.03f, 0f, 32, 2.4f, 5.0f, 0.55f, false, SlotArma.Primaria);
            d["M4"] = Arma("M4", "M4", 30, 90, 0.085f, 22, 29, 1, 0.019f, 0f, 34, 2.1f, 5.2f, 0.5f, false, SlotArma.Primaria);
            d["AWM"] = Arma("AWM", "AWM", 5, 20, 1.45f, 108, 122, 1, 0.002f, 0.14f, 60, 3.6f, 4.3f, 0.85f, true, SlotArma.Primaria);
            d["M24"] = Arma("M24", "M24", 5, 20, 1.45f, 108, 122, 1, 0.002f, 0.14f, 60, 3.6f, 4.3f, 0.85f, true, SlotArma.Primaria);
            d["DesertEagle"] = Arma("DesertEagle", "Desert Eagle", 7, 35, 0.5f, 46, 60, 1, 0.022f, 0f, 28, 2.2f, 5.4f, 0.6f, false, SlotArma.Secundaria);
            d["P92"] = Arma("P92", "P92", 20, 120, 0.3f, 16, 22, 1, 0.03f, 0f, 24, 2.0f, 5.5f, 0.3f, false, SlotArma.Secundaria);
            d["Escopeta"] = Arma("Escopeta", "Escopeta", 6, 30, 0.85f, 14, 19, 8, 0.08f, 0f, 15, 2.8f, 5.0f, 0.3f, false, SlotArma.Primaria);
            d["SMG"] = Arma("SMG", "SMG", 30, 120, 0.065f, 14, 19, 1, 0.026f, 0f, 26, 1.9f, 5.7f, 0.35f, false, SlotArma.Primaria);
            var faca = Arma("Faca", "Faca", 0, 0, 0.55f, 50, 60, 1, 0f, 0f, 1.8f, 0f, 6.2f, 0.5f, false, SlotArma.Faca);
            if (faca.tipo != TipoArma.Corpo) { faca.tipo = TipoArma.Corpo; EditorUtility.SetDirty(faca); }
            d["Faca"] = faca;
            return d;
        }

        static DadosArma Arma(string arquivo, string nome, int pente, int reserva, float cad, int dmin, int dmax, int chumbos,
            float esp, float espAnd, float alcance, float recarga, float vel, float pen, bool luneta, SlotArma slot)
        {
            return Dado<DadosArma>(Raiz + "/Dados/Armas/" + arquivo + ".asset", a =>
            {
                a.nome = nome; a.pente = pente; a.reserva = reserva; a.cadencia = cad; a.danoMin = dmin; a.danoMax = dmax;
                a.chumbos = chumbos; a.espalhamento = esp; a.espalhamentoAndando = espAnd; a.alcance = alcance; a.recarga = recarga;
                a.velocidade = vel; a.penetracao = pen; a.luneta = luneta; a.slot = slot;
            });
        }

        static T Dado<T>(string caminho, System.Action<T> preencher) where T : ScriptableObject
        {
            var a = AssetDatabase.LoadAssetAtPath<T>(caminho);
            if (a != null) return a;
            a = ScriptableObject.CreateInstance<T>();
            preencher?.Invoke(a);
            AssetDatabase.CreateAsset(a, caminho);
            return a;
        }

        // ---------------- materiais ----------------
        static Material Mat(string nome, string shader, Color cor)
        {
            string c = Raiz + "/Materiais/" + nome + ".mat";
            var m = AssetDatabase.LoadAssetAtPath<Material>(c);
            if (m == null) { m = new Material(Shader.Find(shader)); AssetDatabase.CreateAsset(m, c); }
            if (m.HasProperty("_BaseColor")) m.SetColor("_BaseColor", cor); else m.color = cor;
            EditorUtility.SetDirty(m);
            return m;
        }

        static Material Lit(string nome, Color cor)
        {
            var m = Mat(nome, "Universal Render Pipeline/Lit", cor);
            m.SetFloat("_Smoothness", 0.15f);
            return m;
        }

        static Material LitTransparente(string nome)
        {
            var m = Mat(nome, "Universal Render Pipeline/Lit", Color.white);
            m.SetFloat("_Surface", 1f); m.SetFloat("_Blend", 0f);
            m.SetOverrideTag("RenderType", "Transparent");
            m.SetFloat("_SrcBlend", (float)BlendMode.SrcAlpha); m.SetFloat("_DstBlend", (float)BlendMode.OneMinusSrcAlpha);
            m.SetFloat("_SrcBlendAlpha", (float)BlendMode.One); m.SetFloat("_DstBlendAlpha", (float)BlendMode.OneMinusSrcAlpha);
            m.SetFloat("_ZWrite", 0f);
            m.EnableKeyword("_SURFACE_TYPE_TRANSPARENT");
            m.renderQueue = (int)RenderQueue.Transparent;
            m.SetFloat("_Smoothness", 0.15f);
            return m;
        }

        // ---------------- soldado ----------------
        static GameObject CriarPrefabSoldado(Material corpo, Material escuro, Material fantasma, Material barra)
        {
            var raiz = new GameObject("Soldado");
            raiz.AddComponent<CharacterController>();
            raiz.AddComponent<Soldado>();
            var vis = raiz.AddComponent<VisualSoldado>();
            var c = new GameObject("Corpo").transform; c.SetParent(raiz.transform, false);
            Peca(PrimitiveType.Capsule, c, "Tronco", new Vector3(0, 0.9f, 0), new Vector3(0.72f, 0.9f, 0.72f), corpo);
            Peca(PrimitiveType.Cube, c, "Viseira", new Vector3(0, 1.55f, 0.28f), new Vector3(0.42f, 0.12f, 0.12f), escuro);
            Peca(PrimitiveType.Cube, c, "Arma", new Vector3(0.18f, 1.05f, 0.5f), new Vector3(0.08f, 0.1f, 0.75f), escuro);
            vis.soldado = raiz.GetComponent<Soldado>(); vis.corpo = c; vis.materialFantasma = fantasma; vis.materialBarra = barra;
            var p = PrefabUtility.SaveAsPrefabAsset(raiz, Raiz + "/Prefabs/Soldado.prefab");
            Object.DestroyImmediate(raiz);
            return p;
        }

        static GameObject CriarSoldado(GameObject prefab, string nomeObjeto, string nome, int equipe, Vector3 pos, DadosArma[] armas, Material cor)
        {
            var go = (GameObject)PrefabUtility.InstantiatePrefab(prefab);
            go.name = nomeObjeto; go.transform.position = pos;
            var s = go.GetComponent<Soldado>();
            s.nome = nome; s.armasIniciais = new List<DadosArma>(armas);
            var so = new SerializedObject(s); so.FindProperty("equipe").intValue = equipe; so.ApplyModifiedPropertiesWithoutUndo();
            if (cor != null) go.transform.Find("Corpo/Tronco").GetComponent<Renderer>().sharedMaterial = cor;
            return go;
        }

        static void Bot(GameObject prefab, Material cor, string nome, Vector3 pos, float vaiEVem, DadosArma arma)
        {
            var go = CriarSoldado(prefab, nome, nome, 1, pos, new[] { arma }, cor);
            var b = go.AddComponent<BotAlvo>(); b.soldado = go.GetComponent<Soldado>(); b.vaiEVem = vaiEVem;
            // bots olham para o jogador no começo (só aparência inicial)
            go.transform.Find("Corpo").rotation = Quaternion.LookRotation(-pos.normalized + Vector3.forward * 0.001f);
        }

        static GameObject Peca(PrimitiveType tipo, Transform pai, string nome, Vector3 pos, Vector3 escala, Material m)
        {
            var g = GameObject.CreatePrimitive(tipo);
            g.name = nome; Object.DestroyImmediate(g.GetComponent<Collider>());
            g.transform.SetParent(pai, false); g.transform.localPosition = pos; g.transform.localScale = escala;
            g.GetComponent<Renderer>().sharedMaterial = m;
            return g;
        }

        // ---------------- cenário ----------------
        static void Iluminacao()
        {
            var sol = new GameObject("Sol").AddComponent<Light>();
            sol.type = LightType.Directional;
            sol.color = new Color(1f, 0.9f, 0.78f); sol.intensity = 2.2f;
            sol.shadows = LightShadows.Soft; sol.shadowStrength = 0.85f;
            // protótipo: SUN_OFF = (-30, 17, 12) → Unity (-30, 17, -12); a luz aponta do sol para o alvo
            sol.transform.rotation = Quaternion.LookRotation(new Vector3(30f, -17f, 12f));

            RenderSettings.ambientMode = AmbientMode.Trilight;
            RenderSettings.ambientSkyColor = new Color(0.92f, 0.85f, 0.74f) * 0.9f;
            RenderSettings.ambientEquatorColor = new Color(0.65f, 0.57f, 0.48f) * 0.9f;
            RenderSettings.ambientGroundColor = new Color(0.38f, 0.30f, 0.22f) * 0.9f;
            RenderSettings.fog = true; RenderSettings.fogMode = FogMode.Linear;
            RenderSettings.fogColor = CorFundo; RenderSettings.fogStartDistance = 45f; RenderSettings.fogEndDistance = 100f;
            RenderSettings.skybox = null;
        }

        /// <summary>Tonemapping ACES igual ao protótipo (Three.js ACESFilmicToneMapping).</summary>
        static void PosProcesso()
        {
            string c = Raiz + "/Dados/PosProcesso.asset";
            var perfil = AssetDatabase.LoadAssetAtPath<VolumeProfile>(c);
            if (perfil == null)
            {
                perfil = ScriptableObject.CreateInstance<VolumeProfile>();
                AssetDatabase.CreateAsset(perfil, c);
                var t = perfil.Add<Tonemapping>(true);
                t.mode.Override(TonemappingMode.ACES);
                t.hideFlags = HideFlags.HideInInspector | HideFlags.HideInHierarchy;
                AssetDatabase.AddObjectToAsset(t, perfil);
                EditorUtility.SetDirty(perfil);
            }
            var go = new GameObject("PosProcesso");
            var v = go.AddComponent<Volume>(); v.isGlobal = true; v.sharedProfile = perfil;
        }

        static void Cenario(Dictionary<string, Material> m)
        {
            var raiz = new GameObject("Cenario").transform;
            Bloco(raiz, "Chao", new Vector3(0, -0.5f, 0), new Vector3(116, 1, 116), m["Chao"]);

            // paredes de concreto
            Bloco(raiz, "Parede1", new Vector3(6, 1.2f, -3), new Vector3(0.4f, 2.4f, 4f), m["Concreto"]);
            Bloco(raiz, "Parede2", new Vector3(-10, 1.2f, 10), new Vector3(6f, 2.4f, 0.4f), m["Concreto"]);
            Bloco(raiz, "Parede3", new Vector3(14, 1.2f, 12), new Vector3(0.4f, 2.4f, 8f), m["Concreto"]);
            Bloco(raiz, "Parede4", new Vector3(-16, 1.2f, -8), new Vector3(8f, 2.4f, 0.4f), m["Concreto"]);
            // caixas de madeira e de munição
            Bloco(raiz, "Caixa1", new Vector3(-3, 0.6f, 4), new Vector3(1.2f, 1.2f, 1.2f), m["Madeira"]);
            Bloco(raiz, "Caixa2", new Vector3(-4.3f, 0.6f, 4.2f), new Vector3(1.2f, 1.2f, 1.2f), m["Madeira"]);
            Bloco(raiz, "Caixa3", new Vector3(-3.6f, 1.8f, 4.1f), new Vector3(1.2f, 1.2f, 1.2f), m["Madeira"]);
            Bloco(raiz, "Caixa4", new Vector3(3.5f, 0.6f, 8.5f), new Vector3(1.2f, 1.2f, 1.2f), m["Madeira"]);
            Bloco(raiz, "Municao1", new Vector3(-6, 0.35f, -2), new Vector3(1.4f, 0.7f, 0.8f), m["Oliva"]);
            Bloco(raiz, "Municao2", new Vector3(8, 0.35f, 6), new Vector3(1.4f, 0.7f, 0.8f), m["Oliva"]);
            Bloco(raiz, "Municao3", new Vector3(-12, 0.35f, 2), new Vector3(1.4f, 0.7f, 0.8f), m["Oliva"]);
            // sacos de areia (baixos: o tiro passa por cima)
            Bloco(raiz, "SacosAreia1", new Vector3(2, 0.4f, -6), new Vector3(3f, 0.8f, 0.8f), m["Areia"]);
            Bloco(raiz, "SacosAreia2", new Vector3(-2, 0.4f, 13), new Vector3(3f, 0.8f, 0.8f), m["Areia"]);
            // espalhar caixas pelo mapa
            var r = new System.Random(7);
            for (int i = 0; i < 40; i++)
            {
                var p = new Vector3((float)(r.NextDouble() * 100 - 50), 0, (float)(r.NextDouble() * 100 - 50));
                if (p.magnitude < 18f) continue;
                float s = 1f + (float)r.NextDouble() * 0.6f;
                Bloco(raiz, "Caixa_" + i, p + Vector3.up * s * 0.5f, Vector3.one * s, i % 3 == 0 ? m["Oliva"] : m["Madeira"]).transform.rotation = Quaternion.Euler(0, (float)r.NextDouble() * 90, 0);
            }
            // bordas do mapa
            Bloco(raiz, "BordaN", new Vector3(0, 1.5f, 58.2f), new Vector3(116.8f, 3, 0.4f), m["Concreto"]);
            Bloco(raiz, "BordaS", new Vector3(0, 1.5f, -58.2f), new Vector3(116.8f, 3, 0.4f), m["Concreto"]);
            Bloco(raiz, "BordaL", new Vector3(58.2f, 1.5f, 0), new Vector3(0.4f, 3, 116.8f), m["Concreto"]);
            Bloco(raiz, "BordaO", new Vector3(-58.2f, 1.5f, 0), new Vector3(0.4f, 3, 116.8f), m["Concreto"]);
        }

        static GameObject Bloco(Transform pai, string nome, Vector3 pos, Vector3 escala, Material m)
        {
            var g = GameObject.CreatePrimitive(PrimitiveType.Cube);
            g.name = nome; g.isStatic = true;
            g.transform.SetParent(pai, false); g.transform.position = pos; g.transform.localScale = escala;
            g.GetComponent<Renderer>().sharedMaterial = m;
            return g;
        }

        static void Pasta(string caminho)
        {
            if (AssetDatabase.IsValidFolder(caminho)) return;
            int i = caminho.LastIndexOf('/');
            Pasta(caminho.Substring(0, i));
            AssetDatabase.CreateFolder(caminho.Substring(0, i), caminho.Substring(i + 1));
        }
    }
}
