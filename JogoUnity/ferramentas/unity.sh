#!/usr/bin/env bash
# Mesmo que unity.ps1, para Linux/macOS. Uso: ./ferramentas/unity.sh testes|cena|android  (UNITY=/caminho/Unity)
set -e
PROJ="$(cd "$(dirname "$0")/.." && pwd)"
UNITY="${UNITY:-$(ls -d "$HOME"/Unity/Hub/Editor/*/Editor/Unity 2>/dev/null | sort -r | head -1)}"
[ -x "$UNITY" ] || { echo "Unity não encontrada. Defina UNITY=/caminho/Unity"; exit 1; }
C=(-batchmode -nographics -projectPath "$PROJ")
case "${1:-testes}" in
  testes)
    "$UNITY" "${C[@]}" -runTests -testPlatform EditMode -testResults "$PROJ/resultados-testes.xml" -logFile "$PROJ/log-testes.txt" || true
    if [ -f "$PROJ/resultados-testes.xml" ]; then
      grep -o '<test-run[^>]*>' "$PROJ/resultados-testes.xml" | grep -oE '(total|passed|failed)="[0-9]+"' | tr '\n' ' '; echo
      grep -o '<test-case [^>]*result="Failed"[^>]*>' "$PROJ/resultados-testes.xml" | grep -o 'name="[^"]*"' || true
    else echo "Sem resultado: veja log-testes.txt (erro de compilação?)"; fi ;;
  cena)    "$UNITY" "${C[@]}" -quit -executeMethod Jogo.EditorTools.CLI.CriarCenaGreybox -logFile - ;;
  android) "$UNITY" "${C[@]}" -quit -buildTarget Android -executeMethod Jogo.EditorTools.CLI.BuildAndroid -logFile - ;;
  *) echo "Ações: testes, cena, android" ;;
esac
