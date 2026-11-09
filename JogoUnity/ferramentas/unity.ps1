# Comandos da Unity pela linha de comando (Windows / PowerShell). Uso:
#   .\ferramentas\unity.ps1 testes     -> roda os testes automáticos e mostra o resumo
#   .\ferramentas\unity.ps1 cena       -> cria a cena Greybox_BR
#   .\ferramentas\unity.ps1 android    -> gera o APK em Builds/Android
# Se a Unity não estiver no lugar padrão, defina:  $env:UNITY = "C:\caminho\Unity.exe"
param([string]$acao = "testes")
$proj = Split-Path -Parent $PSScriptRoot
$unity = $env:UNITY
if (-not $unity) {
  $unity = Get-ChildItem "C:\Program Files\Unity\Hub\Editor\*\Editor\Unity.exe" -ErrorAction SilentlyContinue |
           Sort-Object FullName -Descending | Select-Object -First 1 -ExpandProperty FullName
}
if (-not $unity) { Write-Error "Unity.exe não encontrada. Defina `$env:UNITY."; exit 1 }
$comum = @("-batchmode", "-nographics", "-projectPath", $proj)
switch ($acao) {
  "testes" {
    $xml = Join-Path $proj "resultados-testes.xml"
    & $unity @comum -runTests -testPlatform EditMode -testResults $xml -logFile (Join-Path $proj "log-testes.txt") | Out-Null
    if (Test-Path $xml) {
      [xml]$r = Get-Content $xml
      $t = $r.'test-run'
      "Testes: $($t.passed) ok, $($t.failed) falharam (total $($t.total))"
      $r.SelectNodes("//test-case[@result='Failed']") | ForEach-Object { " - FALHOU: $($_.name): $($_.failure.message.'#cdata-section')" }
    } else { "Sem resultado: veja log-testes.txt (erro de compilação?)" }
  }
  "cena"    { & $unity @comum -quit -executeMethod Jogo.EditorTools.CLI.CriarCenaGreybox -logFile - }
  "android" { & $unity @comum -quit -buildTarget Android -executeMethod Jogo.EditorTools.CLI.BuildAndroid -logFile - }
  default   { "Ações: testes, cena, android" }
}
