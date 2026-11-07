# Regras do projeto (lidas automaticamente em todo chat)

Jogo tático top-down no navegador (Three.js 0.160, JS puro, sem build). Código em `prototipo/`.

- **Ler só o necessário:** `ESTADO_DO_PROJETO.md` (situação atual) e `prototipo/ESTRUTURA.md` (onde está cada coisa).
  Abrir só os arquivos de código do assunto. **Não ler** `HISTORICO.md` nem `novojogo.md` a não ser que o pedido precise
  (histórico de mudanças antigas / ideias originais). Usar `grep` para achar funções em vez de ler arquivos inteiros.
- Antes de algo grande, explicar o plano e esperar o usuário dizer "ok". Perguntar antes de gastar créditos (ElevenLabs etc.).
- Testes: Playwright headless, sempre na velocidade máxima e sem desenhar a tela. Para teste visual, começar fora do
  prédio e entrar depois, como no jogo real. Mostrar só o resumo dos resultados.
- Respostas em português simples e curtas.

## Publicar (depois de testar)
1. Atualizar `ESTADO_DO_PROJETO.md` (curto: só o que mudou no estado atual). Detalhes do chat vão no fim de `HISTORICO.md`.
2. Commit e push na branch de trabalho `claude/game-fixes-republish-8n23ze`.
3. Site: a branch `claude/save-game-files-repo-rdk6pf` tem outro histórico → criar commit com
   `git commit-tree <árvore nova> -p origin/claude/save-game-files-repo-rdk6pf` e dar push nela (sem forçar).
4. Artifact: `python3 ferramentas/montar_artifact.py saida.html` e publicar `saida.html` em
   https://claude.ai/artifact/45WY4Ec1HckFaMj5SCsgEC
5. Sempre mostrar o link https://caiohg070.github.io/Jogo-novo-fps/ (atualiza em 1–2 min).
