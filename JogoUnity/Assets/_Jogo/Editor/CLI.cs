using System.IO;
using Jogo.Apresentacao;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace Jogo.EditorTools
{
    /// <summary>
    /// Comandos para rodar pela linha de comando (-batchmode -executeMethod Jogo.EditorTools.CLI.Xxx).
    /// Assim o Claude Code monta e confere o projeto sem abrir a janela da Unity.
    /// </summary>
    public static class CLI
    {
        const string CenaGreybox = "Assets/_Jogo/Cenas/Greybox_BR.unity";

        /// <summary>Cria (ou recria) a cena de teste do BR e coloca na lista de build.</summary>
        [MenuItem("Jogo/Criar cena Greybox BR")]
        public static void CriarCenaGreybox()
        {
            var cena = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);
            new GameObject("Partida").AddComponent<Partida>();
            Directory.CreateDirectory(Path.GetDirectoryName(CenaGreybox));
            EditorSceneManager.SaveScene(cena, CenaGreybox);
            EditorBuildSettings.scenes = new[] { new EditorBuildSettingsScene(CenaGreybox, true) };
            AssetDatabase.SaveAssets();
            Debug.Log("[CLI] Cena criada: " + CenaGreybox);
        }

        /// <summary>Gera o APK de teste do Android em Builds/Android/.</summary>
        public static void BuildAndroid()
        {
            var r = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { CenaGreybox },
                locationPathName = "Builds/Android/JogoTatico.apk",
                target = BuildTarget.Android,
                options = BuildOptions.Development,
            });
            Debug.Log("[CLI] Build: " + r.summary.result);
            if (r.summary.result != UnityEditor.Build.Reporting.BuildResult.Succeeded) EditorApplication.Exit(1);
        }
    }
}
