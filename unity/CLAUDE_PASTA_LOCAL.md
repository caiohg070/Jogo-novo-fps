# Jogo (Battle Royale / tático visto de cima, em Unity)

Leia antes de criar qualquer coisa:
- `ESPEC_BASE_JOGAVEL.md`: especificação da base jogável. **Base feita em 09/11/2026** em `JogoUnity/Assets/_Jogo/` (cena `Cenas/Treino.unity`, recriar pelo menu Jogo > Recriar cena de treino). Seguir as regras dela em tudo que vier depois.
- APK Android: menu Jogo > Gerar APK Android → `C:/JogoBuilds/Jogo.apk` + cópia em `Jogo/Jogo.apk` (OneDrive). Nunca recompilar com Play Mode ligado.
- `RESPOSTAS_UNITY.md`: decisões do jogo (modos, armas, acessórios, skins, Blender/MPFB, sons). Fonte mais recente; se divergir do `ESTADO_DO_PROJETO.md`, vale esta.
- `ESTADO_DO_PROJETO.md`: estado do protótipo HTML; parte 2 do BR ficou para depois.
- `QUESTIONARIO_UNITY.md`: questionário original.
- `Referencias_Visuais/GUIA_ESTILO.md` + 13 imagens: estilo visual de todos os assets.
- `Assets_Externos/Human_Soldier_Animations_FREE.unitypackage`: pacote grátis da Asset Store (Kevin Iglesias), ainda NÃO importado. Tem animações Humanoid homem/mulher: Idle, MilitaryIdle, andar/correr em 8 direções (com e sem root motion), mirar/atirar/recarregar (rifle, fuzil de assalto, pistola, 2 pistolas, bazuca), granada, dano, 3 mortes; máscaras de corpo superior; modelos dummy HumanM/HumanF. Usar na base jogável (importar com `unity` e usar as versões SEM root motion, movimento controlado por código). Scripts de demo do pacote não usar.
- `Prototipo_Referencia/`: clone do repositório com o protótipo HTML (`prototipo/js/`). Só referência; copiar números e regras dele.

Ambiente (pronto em 09/11/2026):
- Projeto Unity: `JogoUnity/` (Unity 6000.6.8f1, URP 3D, pacote com.unity.pipeline instalado). Editor aberto responde em `unity status`; comandos com `unity command <grupo> <nome>`.
- Unity CLI logada (caiohg070@gmail.com); plugin `unity@unity-agent-plugin` instalado no Claude.
- Blender com MCP funcionando. Git em `C:\Program Files\Git\cmd`, GitHub CLI em `C:\Program Files\GitHub CLI\gh.exe`, logado como caiohg070.
- Repositório: github.com/caiohg070/Jogo-novo-fps (branch claude/game-fixes-republish-8n23ze).
- Usuário fala português, não é programador: explicar passos simples; logins ele faz.
