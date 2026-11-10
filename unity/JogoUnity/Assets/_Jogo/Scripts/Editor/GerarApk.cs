using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace Jogo.Editor
{
    /// <summary>
    /// Gera o APK de teste para Android (instalar direto no celular, sem loja).
    /// Menu: Jogo > Gerar APK Android. O arquivo sai em C:/JogoBuilds/Jogo.apk.
    /// </summary>
    public static class GerarApk
    {
        const string Cena = "Assets/_Jogo/Cenas/Treino.unity";

        [MenuItem("Jogo/Configurar para Android")]
        public static void Configurar()
        {
            PlayerSettings.companyName = "caiohg";
            PlayerSettings.productName = "Jogo";
            PlayerSettings.SetApplicationIdentifier(UnityEditor.Build.NamedBuildTarget.Android, "com.caiohg.jogo");
            PlayerSettings.bundleVersion = "0.1";
            PlayerSettings.defaultInterfaceOrientation = UIOrientation.AutoRotation;
            PlayerSettings.allowedAutorotateToLandscapeLeft = true;
            PlayerSettings.allowedAutorotateToLandscapeRight = true;
            PlayerSettings.allowedAutorotateToPortrait = false;
            PlayerSettings.allowedAutorotateToPortraitUpsideDown = false;
            PlayerSettings.SetScriptingBackend(UnityEditor.Build.NamedBuildTarget.Android, ScriptingImplementation.IL2CPP);
            PlayerSettings.Android.targetArchitectures = AndroidArchitecture.ARM64;
            PlayerSettings.Android.minSdkVersion = AndroidSdkVersions.AndroidApiLevel26;
            EditorUserBuildSettings.buildAppBundle = false;
            if (EditorUserBuildSettings.activeBuildTarget != BuildTarget.Android)
                EditorUserBuildSettings.SwitchActiveBuildTarget(BuildTargetGroup.Android, BuildTarget.Android);
            AssetDatabase.SaveAssets();
            Debug.Log("Projeto configurado para Android");
        }

        [MenuItem("Jogo/Gerar APK Android")]
        public static void Gerar()
        {
            Configurar();
            // caminho simples (sem acento e fora do OneDrive): o APK sumia quando ia direto para a pasta do OneDrive
            Directory.CreateDirectory("C:/JogoBuilds");
            string saida = "C:/JogoBuilds/Jogo.apk";
            var op = new BuildPlayerOptions
            {
                scenes = new[] { Cena },
                locationPathName = saida,
                target = BuildTarget.Android,
                targetGroup = BuildTargetGroup.Android,
                options = BuildOptions.None,
            };
            var r = BuildPipeline.BuildPlayer(op);
            var s = r.summary;
            if (s.result == BuildResult.Succeeded && File.Exists(saida))
            {
                // cópia na pasta Jogo (sincroniza no OneDrive para pegar no celular)
                string copia = Path.GetFullPath(Path.Combine(Application.dataPath, "../../Jogo.apk"));
                File.Copy(saida, copia, true);
                Debug.Log($"APK copiado para {copia}");
            }
            if (s.result == BuildResult.Succeeded)
                Debug.Log($"APK pronto: {saida} ({s.totalSize / (1024f * 1024f):0.0} MB, {s.totalTime.TotalMinutes:0.0} min)");
            else
                Debug.LogError($"APK falhou: {s.result}, {s.totalErrors} erro(s)");
        }
    }
}
