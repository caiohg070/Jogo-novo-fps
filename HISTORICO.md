# Histórico do projeto (detalhes de cada chat — só ler se precisar)

> **Para continuar em um novo chat:** cole este arquivo (ou peça para o Claude ler `ESTADO_DO_PROJETO.md`
> e `novojogo.md` do repositório `caiohg070/jogo-novo-fps`, branch **`claude/game-fixes-republish-8n23ze`** — é a mais nova;
> a `claude/save-game-files-repo-rdk6pf` ficou com a versão anterior).
> **Regra do projeto:** sempre perguntar antes de iniciar algo grande ou gastar créditos (ElevenLabs/Higgsfield/Magnific).

Última atualização: 07/11/2026 (4º chat — Base Militar e itens flutuantes).

---

## 1. Onde está tudo

| O quê | Onde |
|---|---|
| Documento de ideias original | `novojogo.md` |
| Imagens de referência (ref01–ref08) | `referencias/` |
| **Jogo (protótipo no navegador)** | `prototipo/index.html` (arquivo único, ~3060 linhas) |
| Sons (mp3 do ElevenLabs) | `prototipo/sons/*.mp3` |
| Sons embutidos (base64) usados pelo jogo | `prototipo/sons/sons.js` (gerado a partir dos mp3) |
| Manual do protótipo (controles, modos) | `prototipo/README.md` |
| Página raiz para GitHub Pages (redireciona p/ `prototipo/`) | `index.html` + `.nojekyll` |
| Jogo publicado (para testar no celular) | https://claude.ai/artifact/45WY4Ec1HckFaMj5SCsgEC |
| **Jogo no GitHub Pages (link principal do usuário)** | https://caiohg070.github.io/Jogo-novo-fps/ (servido da branch `claude/save-game-files-repo-rdk6pf`) |
| Sons no ElevenLabs | flow "Jogo tático - efeitos sonoros" (id `HB0RnWHvUUjmllWHYXRE`) |
| Branch de trabalho | **`claude/game-fixes-republish-8n23ze`** (mais nova, atualizada no 6º chat; `claude/game-fixes-republish-kvd4j8` e `claude/save-game-files-repo-rdk6pf` têm o mesmo conteúdo). Não existe `main` |

**Como abrir localmente:** abrir `prototipo/index.html` no Chrome (precisa de internet para baixar o Three.js da CDN).

**Como publicar o artifact de novo:** o artifact não aceita `<html>/<head>/<body>` nem arquivos externos;
rodar `python3 ferramentas/montar_artifact.py /caminho/jogo.html` (junta index.html + css + js + sons num arquivo só, sem essas tags) e publicar o resultado.

**Código separado em arquivos (5º chat):** `prototipo/index.html` só tem o HTML; estilo em `css/`, código em `js/` (mapa, personagens, inimigos, itens, modos, jogo). Mapa de onde está cada coisa: `prototipo/ESTRUTURA.md`. Ordem de carregamento: `prototipo/js/arquivos.js`.

**GitHub Pages (ATIVO):** https://caiohg070.github.io/Jogo-novo-fps/ — publicado da branch `claude/save-game-files-repo-rdk6pf` (raiz).
⚠️ **REGRA DO USUÁRIO:** a cada atualização, além do push na branch de trabalho e de republicar o artifact, fazer push
da mesma versão para `claude/save-game-files-repo-rdk6pf` (`git push origin HEAD:claude/save-game-files-repo-rdk6pf`,
só avanço/fast-forward) para o site atualizar, e **sempre mostrar o link** https://caiohg070.github.io/Jogo-novo-fps/ na resposta.
O site leva ~1–2 min para atualizar depois do push.

---

## 2. Tecnologia e formato do código

- **HTML + CSS + JavaScript puro** (ES module) em um só arquivo, **Three.js 0.160.0** via importmap
  (`cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js`). Sem build, sem npm.
- Sons: **Web Audio API**. Os mp3 vêm de `window.SONS` (base64), são decodificados uma vez em `SFX[nome]`
  e tocados com `sfx(nome, volume, {muffle, dur, rate})`. Se um som não carregar, cai no som sintetizado.
- Câmera **perspectiva fixa** (ângulo nunca muda, só a posição acompanha o jogador), estilo Brawl Stars.
- Personagens: **modelos 3D low-poly feitos de caixas** (decidido: **não** usar sprites 2D).
- Física própria simples (sem engine): colisão círculo × caixas (AABB), chão = terreno + "surfaces" (pisos/rampas).
- Tiro: **hitscan**. Acerto calculado em 2D (raio × círculo do alvo, `HIT_R = 0.36`), depois checa obstáculo em 3D
  com `shotBlock()` em **3 trechos**: horizontal perto de quem atira, linha do meio, horizontal perto do alvo
  (assim cobertura baixa protege quem está colado nela e quem está no alto atira por cima da própria mureta).

### Seções do `prototipo/index.html` (na ordem)

| Seção (comentário `// ====`) | O que tem |
|---|---|
| `<style>` / HTML | HUD (vida, colete, munição, lista de armas, minimapa, placar, feed), controles touch, tela inicial (modo, classe, dificuldade, clima), loja, placar final |
| utilidades | `clamp`, `lerp`, `smooth`, `rand`, `pick`, `angDiff` |
| **regras** | `MAP=58` (meio-tamanho do mapa), `HOUSE`, `H0/H1` (pisos da casa), `SHOT_H=1.0`, `BODY_R`, `HIT_R`, **`WEAPONS`** (dano, cadência, dispersão, alcance, recarga, velocidade, `pen` = penetração no colete), `NADES`, **`CLASSES`** (loadout, colete, capacete, cores), `DIFF` (fácil/médio/difícil), `TEAM_COLOR` |
| terreno | `rawHeight()` (morros, ruas), `flatten()` (deixa plano sob casa/barracão/bunker), `terrainHeight()`, `terrainColor()` |
| renderer / cena | luzes (sol baixo + hemisférica + lanterna noturna), malha do terreno |
| construção | `box()` (cria caixa + colisor + "solid" para tiro + "fade" + "upper"), `footing()`, `wall()`, `windowWall()` |
| casa de 2 andares | térreo, janelas, escada (rampa + colisores por baixo), terraço com mureta 0,95 m |
| objetos do mapa | `crate` (quebra com tiro), `sandbags`, `barrier`, `car`, `truck`, `container`, `pipes`, `pole` (poste com luz), `barrel`, `fence`, anel externo gerado com semente |
| bunker subterrâneo | sala a −3,2 m com rampa e teto que some quando você entra |
| barracão | 20 × 15 m, 4 portas, caixas dentro (ponto A da bomba) |
| física e visão | `groundAt`, `collide`, `firstHit`, `shotBlock`, `smokeBlocks`, `los`, `lean/peek` (regras do terraço), `aimPoint`, `canShoot` |
| efeitos | partículas, traçantes, luz de explosão/disparo, tremor de câmera |
| som | `initAudio`, `sfx`, `shotSound`, `bang`, `boom`, `hiss`, etc. |
| soldados | `buildSoldier()` (modelo + armas + paraquedas), **classe `Soldier`** (`spawn`, `move`, `physics`, `update`, `tryFire`, `stab`, `heal`, `useKit`, `switchTo`, `startReload`) |
| estado do jogo | `damage()` (colete/capacete), `die()`, placar, feed, `toast`, números de dano |
| granadas | `throwNade`, `updateNades` (quica), `flashBang`, `explode` (HE), `startSmoke` |
| baús de loot | `LOOT_SPOTS`, `rollLoot`, `giveLoot`, abrir/pegar (`lootAction`, botão `#actBtn`/tecla F) |
| IA dos bots | `newAI`, `updateBot` (patrulha por `WP`, busca, combate com strafe, rajadas, só atira com linha livre, flanqueia, joga granada, médico se cura, objetivo da bomba, roam no BR), `separate` |
| clima | chuva (LineSegments), poças, `applyWeather('dia'|'chuva'|'noite')` |
| entrada | joystick, botão de mira (segura = atira; AWP: segura mira, solta atira), botões granada/cura/andar/recarga, teclado e mouse |
| câmera, paredes, HUD | câmera, paredes transparentes na frente, **silhueta** de inimigo atrás de parede, setas na borda, `updateHud`, minimapa com pings |
| Battle Royale | avião, salto, paraquedas, zona que fecha |
| Bomba | locais A/B, plantar 3 s, timer 35 s, desarme 5 s, economia/loja, rodadas |
| partida | `setupMatch()` (cria jogadores por modo), `respawnAll()` |
| loop | `frame()` |
| tela inicial | escolhas do menu, botão JOGAR, tela cheia, pausa ao bloquear o celular |

Ganchos de teste no `window`: `__game`, `__los`, `__cs`, `__die`, `__bomb`, `__zone`, `__jump`, `__sfx`, `__ts`.
Os testes foram feitos com Playwright (Chromium headless) simulando tiros/posições.

---

## 3. O que já foi feito (histórico resumido)

**Base**
- Mapa com relevo, ruas rebaixadas, montanhas na borda; agora 116 × 116 m (centro original + anel externo com 4 morros, 5 ruínas, contêineres, carros, caixotes, barris, 12 baús extras).
- Casa de 2 andares (térreo com janelas/portas + escada + terraço com mureta), barracão grande com 4 portas, bunker subterrâneo.
- Telhado/terraço some quando você entra no térreo; paredes na frente da câmera ficam transparentes.

**Controles (celular estilo Brawl Stars)**
- Joystick à esquerda; botão de mira à direita (segura e arrasta = mira e já atira; toque rápido = mira automática).
- Botões 80% transparentes, mais para o centro. Botões: granada (segura/arrasta/solta), cura/kit, andar devagar, recarregar, tela cheia.
- PC: WASD, mouse, clique, 1/2/3, 4 (granada), G, E, B, F, R, Shift.

**Armas e itens**
- AK-47, Colt M4, AWP (segura mira / solta atira, zoom; 1 tiro sem colete), Desert Eagle (0,5 s), pistola (0,3 s), faca.
- Granadas: HE, flash (cega quem olha), smoke (bloqueia visão dos bots).
- Colete e capacete (reduzem dano), kits médicos (2,5 s, +45), caixotes quebráveis.
- Baús verdes: ABRIR mostra o item, PEGAR coleta; reabastecem em 30 s.

**Classes:** Terrorista, CT, Médico (cura +40 em área), Sniper.

**Modos:** Treino (vs 2 bots), Mata-mata 3×3 (20 abates), Bomba 3×3 (economia, loja, 5 rodadas), Battle Royale 8 jogadores (avião, paraquedas, zona).

**Bots:** dificuldade fácil/médio/difícil; visão 24 m (AWP 34 m); ouvem tiros e passos; aliados patrulham sozinhos; CTs checam a área antes de desarmar; time que planta fica de tocaia.

**Justiça da visão:** silhueta do inimigo que você vê atrás de parede, setas na borda para inimigo fora da tela, câmera mostra mais a parte de baixo, mira para no inimigo e some com a distância, pings de tiro/passos no minimapa.

**Regras de cobertura (importante)**
- Cobertura baixa (barreira 1,25 m, sacos 1,22 m, caixote 1,15 m) protege quem está colado nela.
- Terraço: quem está colado na mureta só aparece quando atira; quem está no alto atira por cima da mureta.
- Tiro passa por janela (de propósito). Terreno só bloqueia se o tiro passar 0,3 m abaixo do topo do morro.

**Visual/clima:** dia, chuva (poças, chão molhado), noite com chuva (postes acesos).

**Sons (ElevenLabs, ~1.150 créditos gastos no total):** ak, m4, awp, deagle, pistola, faca, recarga, explosao, flash, smoke, passo, chuva, bipe, aviao, paraquedas, plantar, bau, pegar, seco (sem bala), sacar, acerto.

**Outros:** HUD estilo CS, placar final (abates/mortes/dano) com JOGAR DE NOVO/MENU, pausa ao bloquear o celular, botão de tela cheia.

**Bugs corrigidos importantes:** tiro atravessando parede (2× — a última foi um `else` preso na checagem do caixote),
bot colado na parede tomando tiro, arma atravessando parede, escada (obstáculo, atravessar por trás, fresta no vão),
bots travados sem linha de tiro, CTs correndo direto para desarmar, avião fora da câmera, chuva tocando com tela bloqueada.

**2º chat (07/11/2026) — branch `claude/game-continuation-improvements-crkbqw`**
- **Navegação dos bots com A\*** (seção `navegação dos bots`, antes da IA): grade de 0,5 m (`navBlocked`, `navHgt`),
  colisores inflados 0,4 m, `navPath()` (A\* 8 direções, sem cortar quina, caminho suavizado), `navSteer(b, x, z)` usado em
  busca, objetivo da bomba, roam do BR e patrulha. Anda reto quando a linha está livre; dentro da casa, no terraço/escada e
  no bunker usa a rota feita à mão. Caixote quebrado chama `navRefresh()`. Teto do bunker conta como chão; vão da rampa bloqueado.
  Testado: portas da casa e do barracão funcionam, ~3 ms por caminho.
- **BR:** bot sem arma/colete/capacete vai até o baú mais perto (≤30 m, dentro da zona). Testado: um bot pegou AWP, colete e capacete.
- **Indicador de dano:** arco vermelho em volta do jogador apontando para quem atirou (`hitDir`).
- **Câmera do abate:** ao morrer, a câmera vai até quem te matou por ~2 s (com silhueta) e mostra nome, arma e vida dele (`killInfo`, `killCamTarget`).
- **Som posicional (estéreo):** `sfx(..., {pan})` + `panOf(pos)` em tiros, passos, recarga, faca, flash, HE, smoke.
- **Sons sintetizados** (sem créditos): bala no concreto/ricochete (`bulletHit`), pino da granada (`pinPull`), alicate do desarme (`snip`), caixote quebrando.
- **Pausa:** botão II (canto esquerdo) ou Esc/P → CONTINUAR / SAIR PARA O MENU.
- **Histórico salvo no aparelho** (localStorage `tatico.carreira`): partidas, vitórias, abates, mortes, K/D, melhor colocação no BR — aparece na tela inicial.
- Gancho de teste novo: `window.__nav`.
- ⚠️ **Não verificado:** em teste artificial (jogador e outros bots desligados à força), 2 bots ficaram em estado "engage" parados
  sem inimigo vivo por 70 s+. Pode ser só o teste ou bug real da IA (alvo morto/desligado não limpa o estado). Investigar primeiro.
- O artifact (link da seção 1) **ainda não foi republicado** com essas mudanças; README do protótipo também não foi atualizado.

**3º chat (07/11/2026) — branch `claude/game-expansion-ideas-2n8tnt`**
- **Armas novas:** Escopeta (8 chumbos, forte de perto), SMG (rápida, corre mais), Metralhadora/LMG (pente de 100).
- **Acessórios** (baú/loja, valem para a arma principal): **silenciador** (som baixo, não aparece no minimapa, bots ouvem só a 8 m) e **mira** (+25% alcance, −20% dispersão, câmera um pouco mais longe).
- **Granadas novas:** Molotov (fogo 7 s, bots fogem do fogo), Impacto (explode ao tocar), Mina (arma em 1 s, explode com inimigo ou veículo inimigo perto). Terrorista começa com 1 molotov, CT com 1 mina.
- **Roupas/camuflagem (só visual, combinado não mexer na visão dos bots):** Padrão, Deserto, Floresta, Urbano, Neve, Ghillie. **Acessórios:** boina, óculos, máscara, mochila. Escolha salva no aparelho (`tatico.visual`). Bots do BR usam roupas aleatórias.
- **Veículos:** 4 quadriciclos e 2 jipes (`VEH`, classe `Vehicle`). Joystick aponta a direção, atropela inimigo, tiro/explosão estragam, explode com 0 e volta em 45 s. Som de motor sintetizado.
- **Metralhadora fixa** em 2 sacos de areia (`turretAt`): arco de ±63°, superaquece (barra laranja), quem usa fica com a cabeça exposta.
- **Mapa:** mato alto/moitas (quem está dentro e não atirou há 1,5 s só é visto a 3,5 m — vale para todos), 3 cabanas com paredes de madeira que quebram, **portas** na casa e no barracão (abrem/fecham, quebram com tiro, bots abrem sozinhos; ficam fora da grade A*), **telhado do barracão + escada de mão** na parede leste, **tirolesa** terraço ⇄ morro oeste.
- **Botão laranja / F** agora escolhe a ação certa (`playerAction`): saltar, sair/entrar veículo, metralhadora, plantar, levantar aliado, baú, tirolesa, porta.
- **Battle Royale:** **airdrop** aos 50 s e 130 s (caixa vermelha de paraquedas, LMG/AWP + colete + capacete + acessório + granada). Bots vão buscar.
- **Drone** (Sniper começa com 1; baú/loja): marca inimigos a 35 m por 6 s; bots também usam e avisam o time.
- **Caído/reanimar** (Mata-mata, Bomba, Bandeira): com 0 de vida cai, rasteja, sangra 20 s; aliado parado ao lado levanta em 3 s (médico 2× mais rápido, ou na hora com a cura). Time todo caído = morrem.
- **Modo novo: Capture a Bandeira** 3×3 (bases sul/norte, 3 capturas). Bots têm papel atacar/defender.
- **Clima novo:** Neblina (visão dos bots ×0,6).
- **Bug do "engage" parado:** não consegui reproduzir; adicionei proteção (sai do combate se ficar 2 s sem alvo, mesmo cego; alvo no avião não conta).
- Testado com Playwright em todos os modos, sem erros no console.

**4º chat (07/11/2026) — branch `claude/game-fixes-republish-8n23ze`**
- Teste longo automático (Playwright, tempo acelerado 20×) em todos os modos e climas: sem erros; patrulha/combate dos bots ok.
- Celular: botão laranja de ação (ex.: SALTAR DO AVIÃO) subiu/foi para a esquerda — antes cobria a caixa de munição.
- Lista de armas: texto "pegue em baús" vazava da caixa → "ache em baú".
- Artifact republicado com tudo do 2º, 3º e 4º chats; README e este arquivo corrigidos.
- **Escada de mão do barracão** agora é botão: SUBIR ESCADA / DESCER ESCADA (usa o mesmo sistema da tirolesa, `ladderZ` em `zips`, 1,3 s). Não é mais rampa.
- **Portas** não ficam mais transparentes (saíram de `fadeables`).
- **Mira/tiro sem alvo acompanham o relevo** (`groundShot`, trechos de 1,5 m): sobem morro e descem em parte baixa em vez de bater no chão. Linha de mira conta o acessório mira.
- **Metralhadora fixa:** só aparece no modo Bandeira; superaquece com 20 tiros (~1,5 s) e fica 4 s sem atirar; tiro sai na frente dos sacos de areia (antes batia neles).
- **SMG:** dispersão 0,036 → 0,026, alcance 22 → 26; traçante não sai de trás da parede quando colado nela (todas as armas).

**Não feito (combinado com o usuário):**
- Besta silenciosa — usuário não quer. Barris explosivos — não quer. Camuflagem afetar visão dos bots — não quer.
- **Modo Zumbi — fazer depois.**
- Pendente técnico: bots ainda não dirigem veículos; passageiro atirando no jipe; bots não usam metralhadora fixa nem tirolesa.

---

## 4. O que falta / próximos passos

**✅ Pedidos do 5º chat (feitos no 6º chat)**
1. Arma sem bala: clique "seco" agora toca baixo (0,16) e no máximo 1× a cada 0,5 s (`tryFire()`, campo `dryAt`).
2. Aviso de abate (`#feed`): saiu do topo central; agora é pequeno (10 px), no canto superior direito ao lado das armas, no máximo 3 linhas.
3. Mira laser: `aimLine` sai do cano (`muzzlePos()`), na altura da arma, fina e vermelha.
4. Câmera: removido o deslocamento `z += 1.8`; a câmera mira o meio do corpo (`y += 0.9`). Jogador fica exatamente no centro (testado 844×390 e 390×844).
5. Som da Colt M4: o `m4.mp3` é ~16 dB mais baixo que os outros; ganho extra `SND_GAIN = { m4: 5 }` em `shotSound`.

**✅ Pedidos do 6º chat (2ª rodada)**
- Atraso no 1º tiro: `FIRST_SHOT_DELAY = 0.18` s (`updatePlayer`, `fireHoldT`) — só armas de fogo do jogador; a rajada segue normal depois.
- Pega-bandeira: coluna de luz alta e piscando em cada bandeira (`F.beam`), seta laranja `#objArrow` (`updateObjArrow()`)
  que aponta para o objetivo com texto e distância (BANDEIRA INIMIGA / LEVE PARA SUA BASE / RECUPERE SUA BANDEIRA / PROTEJA …)
  e anel pulsando no minimapa em volta da bandeira inimiga.

**✅ 6º chat (3ª rodada)** — Placar (`updateScore`): tirado "sua: na base · inimiga: na base" do Bandeira e o "abates/mortes" pessoal do Mata-mata (parecia 2ª contagem); agora mostra `até N`. Conferido nos 5 modos.

**✅ 6º chat (4ª rodada) — ideias opcionais aprovadas**
- **XP/níveis:** `career.xp`, `levelInfo()`, `addXP()`; abate 100, captura 300, plantar 150, vitória 500, partida 50, tutorial 200.
  Nível l→l+1 custa `300 + 200·(l−1)`. Mostrado no menu (barra) e no fim da partida (`#boardXP`, "SUBIU PARA O NÍVEL N!"). Sem desbloqueios ainda.
- **Configurações** (`cfg`, salvo em `localStorage 'tatico.cfg'`): volume geral (nó `masterOut`), tamanho, visibilidade e altura dos
  botões de toque (CSS `--ctl-s`, `--ctl-op`, `--ctl-y`). Botão ⚙ no menu e na pausa.
- **Tutorial:** opção TUTORIAL nos modos (roda no treino): 6 passos (`TUT`, `updateTut()`), bots parados e imortais até o último passo.
- **Vidro que quebra:** `windowWall()` cria vidro (`glasses`), quebra com tiro (`glassAlong`) ou explosão; volta a cada partida (`resetGlass`).
  Não bloqueia visão nem tiro.
- **Pequena destruição nas paredes:** cada tiro deixa marca escura + lascas da cor da parede (`wallChip`). Marcas e lascas (que caem e ficam no chão) duram `CHIP_LIFE = 8` s e somem aos poucos (`updateChips`).

**✅ 6º chat (5ª rodada) — tutorial completo:** 13 passos em `TUT` (andar, atirar, recarregar, trocar arma, granada, abrir baú,
pegar item, entrar no carro, dirigir, sair, abrir porta, subir escada, eliminar bots). No celular o botão certo pisca (`.tutHi`);
no PC aparece a tecla (`#tutKey`). Baú/carro/porta/escada têm seta (`tutTarget()` → `#objArrow`). Ações registradas em `lootAction` (`tut.acts`).
Jogador novo (sem partidas, sem tutorial e sem ter pulado) vê `#firstBoard` "PRIMEIRA VEZ AQUI?" (Fazer/Pular → `career.tutSkip`).

**➡️ PRÓXIMO CHAT — pedidos do usuário ainda NÃO feitos (fazer primeiro)**
1. ✅ FEITO (5º chat: `dropStacked`/`updateFalling` — a de cima cai) — **Caixotes empilhados:** a caixa só some quando é quebrada, e a de **cima fica flutuando** quando a de baixo quebra.
   Onde: `crate()` (pilha com `stack`) e `hurtProp()` (remove mesh + collider). Fazer a de cima cair até o chão/caixa de baixo
   (ou quebrar junto), atualizando o collider (`m.userData.col`).
2. ✅ FEITO (5º chat: em `updateWalls`, atrás da casa esconde `upper` e deixa paredes da casa transparentes) — **Andar de cima da casa:** quando o jogador está no 2º andar **não aparece o personagem** e **não dá para ver portas e janelas**.
   Onde: `updateWalls()` / `fadeables` / `upper` / `insideHouse()` (lógica que esconde o telhado/andar de cima e deixa paredes
   transparentes). Garantir que, no andar de cima, o jogador fique visível (paredes/laje acima dele transparentes) e que portas e
   janelas (`doors`, `glasses`, vãos de `windowWall`) continuem visíveis ou marcadas.

**Pendências pequenas no protótipo**
- [ ] Sons que falharam por fila do ElevenLabs: puxar pino da granada, alicate de desarme, bala no concreto, caixote quebrando.
- [ ] Som da chuva tem só 2 s (repete); gerar um mais longo se incomodar.
- [x] GitHub Pages ativo (ver seção 1).
- [x] ~~Bots sem navegação de verdade~~ → A\* feito no 2º chat.
- [ ] Investigar bots presos em "engage" sem inimigo (ver aviso acima).
- [x] Artifact republicado e README atualizado (4º chat).
- [ ] Mapa maior vale para todos os modos (nos modos 3×3 o anel externo fica pouco usado).

**Do documento `novojogo.md` ainda não feito**
- [ ] Casas/sobrados de **3 andares** (decidido: fazer direto na Unity).
- [ ] Visual realista das referências (texturas, sombras, interiores) — decidido: **não** investir no protótipo, fazer na Unity.
- [ ] Imagens geradas (Higgsfield/Magnific, sprite sheets) — não necessárias agora (sem sprites 2D).
- [ ] Multiplayer online (o documento pede começar sem).
- [ ] Empacotar para Play Store (Capacitor) **ou** migrar para **Unity** (plano principal do usuário).

**Ideias sugeridas (ainda não feitas, perguntar antes)**
- Progressão: XP/níveis, desbloquear skins/acessórios, desafios diários.
- Ping/marcação para aliados e ordens rápidas aos bots aliados ("me siga", "segure o A").
- Replay curto do abate, estatísticas por arma, mapa de calor das mortes.
- Mais mapas/variações (porto, vila com sobrados de 3 andares na Unity), portas que abrem/fecham, vidro que quebra.
- Configurações: volume, tamanho/posição dos botões, sensibilidade da mira, qualidade gráfica (sombras) para celular fraco.
- Tutorial interativo curto na primeira vez.

**Plano combinado**
1. Usuário aprova a jogabilidade no protótipo.
2. Migrar para **Unity** (usuário tem notebook): Claude escreve os scripts C#, usuário abre o projeto/clica Play/gera APK.
   Reaproveitar: números de `WEAPONS`/`CLASSES`/`DIFF`, regras de cobertura e terraço, IA dos bots, modos, mapa (posições), sons de `prototipo/sons/`.

---

## 5. Como pedir mudanças no próximo chat (sugestão)

> "Leia `ESTADO_DO_PROJETO.md` e `novojogo.md` do repositório caiohg070/jogo-novo-fps (branch
> claude/game-fixes-republish-8n23ze). Continue o protótipo em `prototipo/index.html`.
> Depois de cada mudança: testar, fazer commit/push na mesma branch e republicar o artifact
> https://claude.ai/artifact/45WY4Ec1HckFaMj5SCsgEC."

## Atualização (tiros no relevo, granada, postes)
- Tiro em morro/telhado/terraço: se o caminho padrão bate, tenta linha reta até peito/ombro/cabeça (`shootRay` em `js/personagens/soldados.js`; bots usam a mesma regra em `canShoot`, `js/base/fisica-visao.js`). Testado: morro 20/20 em 12 ângulos, terraço da casa 0/20 → 20/20; atrás do morro continua bloqueado.
- Linha da mira inclinada igual à bala; traçante reto; folhas dos arbustos meio transparentes (não conferidos jogando).
- Granada: marca suave que segue o relevo (`scorchMark` em `js/base/efeitos-som.js`).
- 8 postes extras (`js/mapa/objetos.js`), luz só à noite via lâmpada + círculo no chão (sem PointLight).
- Ideia futura: online por código de sala (PeerJS), ainda não feito.

## Ajustes em 4 etapas (pedido após teste automático a 4x)
Teste jogou todos os modos sozinho: sem erros de código. Problemas achados viraram as etapas abaixo.
O sniper perder a AWP ao morrer na Bomba é de propósito (não mexer).

- [x] **Etapa 1 – loja e armas (feita):** tirado o item "Mira" (loja, baús, caixa do BR); tirada a granada de Impacto (loja, ordem das granadas, bots, BR — agora só HE); escopeta mais forte (dano 14–19 por chumbo, alcance 15); Bomba: espaço vazio diz "compre (B)" e dinheiro de plantar respeita limite de $16.000.
- [x] **Etapa 2 – AWP (feita):** com arma de luneta (AWP), vivo e a pé, a câmera desliza 3,5 m para o lado da mira (`scopeOff` em `js/jogo/camera-hud.js`, entra/sai suave); afastamento da luneta caiu de 1,4 para 1,2. Testado: câmera anda 3,5 m na direção mirada, sem erros.
- [x] **Etapa 3 – bots (feita):** causa principal: o mapa de caminhos ignorava portas, mas a folha da porta ABERTA é parede (porta de dentro da casa) → bots empacavam em (0,−12)/perto da casa. Agora a folha aberta conta como obstáculo (`leaf` em `js/mapa/portas.js`, `navHits`/`navRefresh` em `navegacao.js`) e o A* também vale dentro da casa. Preso 2 vezes seguidas → desiste e vai 2 pontos à frente (`stuckN` em `ia-bots.js`). MÉDIO erra mais (`err` 1 → 1,3). Teste simulado 4 min: Mata-mata antes até 64 checagens presas no mesmo ponto, agora 0–2 rápidas; parados na Bandeira são defensores na base.
- [x] **Etapa 4 – modos (feita):** Bandeira: quem carrega vai por um corredor lateral (x=±24) e só depois para a base (`ctfRoute` em `bandeira.js`, também usado em combate em `ia-bots.js`); escolta 4 m à frente e dos lados; partida com no máximo 8 min (`CTF_TIME`, tempo no placar via `estado.js`; fim por tempo = mais capturas vence, ou empate). BR: saltos espalhados pelo mapa com distância mínima e horários escalonados; zona começa aos 45 s e fecha em 300 s; airdrops aos 70 s e 200 s. Teste rápido (sem desenhar a tela): 2 partidas de Bandeira de 8 min → uma 1×1 com capturas pelos corredores, outra 0×0 sem ninguém pegar a bandeira; BR com pontos de salto bem espalhados e zona no tempo certo. Aumentar o mapa do BR: outro chat.

## Mapa grande e sorteado no Battle Royale (chat seguinte às 4 etapas)
- Ao escolher **Battle Royale** e apertar JOGAR, o menu guarda as escolhas em `sessionStorage` (`tatico.pend`, com uma semente aleatória) e **recarrega a página**; aparece "MAPA NOVO PRONTO (nº …)" com botão JOGAR (o toque é necessário para som/tela cheia). Código em `js/jogo/menu.js` (`newMap`, `mapOverlay`, `brUsed`). JOGAR DE NOVO no BR também gera mapa novo (`js/jogo/loop.js`). Voltar para outro modo recarrega no mapa normal. Sem `sessionStorage` (navegador bloqueando), joga no mapa já carregado.
- `js/base/utilidades-regras.js`: `PEND`, `BR_SEED`, `srnd()` (sorteio com semente); `MAP` = 90 no BR (**180 × 180 m**) e 58 nos outros modos (116 m, igual antes).
- `js/base/terreno-cena.js`: 9–13 morros sorteados no anel novo (`BR_HILLS`); malha do chão com 240 divisões no BR.
- `js/mapa/objetos.js`: anel externo sorteado e com 3× mais coisas no BR (carros, barreiras, sacos, caixotes, contêineres, barris, ruínas, cabanas, mato, postes, 36 baús); nos outros modos continua a semente fixa 7. `BR_SPOTS` → 6 veículos extras (`js/itens/veiculos.js`), total 12.
- `js/inimigos/ia-bots.js`: 12 pontos de patrulha extras no anel do BR; no BR, enquanto a zona é grande, o bot anda 10–32 m de onde está (antes ia para pontos do mapa todo e todos se juntavam no meio).
- `js/modos/battle-royale.js`: avião atravessa o mapa todo (`MAP*1.2`); bots saltam espalhados **ao longo da rota do avião** (o paraquedas só plana ~25 m); zona começa com raio `MAP*1.47`, centro sorteado ±35% do mapa, começa a fechar aos 55 s e fecha em 360 s.
- Teste rápido (sem desenhar, tempo simulado): sementes diferentes geram mapas diferentes; mapa normal continua com 27 baús/6 veículos; BR com 57 baús/12 veículos; 2 partidas de 400 s com bots espalhados pelo mapa até sobrar 1; menu → BR → recarrega → JOGAR → JOGAR DE NOVO (mapa novo) → Mata-mata (mapa normal), sem erros.
- Não medido: desempenho em celular fraco com o mapa maior.

## Correções: tiro com diferença de altura, morro nas ruas, chão do bunker
- **Tiro morro/telhado** (`js/jogo/entrada.js`, `aimSnap`): a mira (mouse e joystick) é calculada na altura do jogador; um inimigo mais alto/baixo aparece deslocado na tela, então mirar na imagem dele errava. Agora, se a mira passa sobre a imagem de um inimigo visível com diferença de altura, a direção vai para a posição real dele. Teste (1.108 posições com ≥1,2 m de diferença, clicando no peito do bot na tela): acertos 17% → 97%.
- **Ruas cortando o morro** (`js/base/terreno-cena.js`, `baseHeight`/`rawHeight`): a rua agora acompanha a altura média do relevo em volta (7 m) em vez de achatar para um plano. Inclinação máxima perto das ruas no BR: até 2,5 (68°) → abaixo de 0,95.
- **Bunker** (`js/base/terreno-cena.js`): a malha do chão é alinhada às bordas do bunker e os triângulos de dentro são removidos (antes uma rampa afundava por fora das paredes).
- Teste rápido sem desenhar: Mata-mata 300 s e BR sem erros.

## Correções na casa: tiro varando parede na escada, muretas, laje transparente
- A transparência das paredes NÃO afeta o tiro (testado: mesmos resultados com paredes normais ou transparentes/escondidas).
- **Causa 1** (`js/personagens/soldados.js` + `shotLen` em `js/base/fisica-visao.js`): o bloqueio medido pelo caminho "dobrado" (sobe/desce) era comparado com a distância em LINHA RETA; o caminho é mais longo, então uma parede batida perto do alvo parecia "depois do alvo" e o tiro contava. Agora compara com o comprimento do próprio caminho. Lógica do tiro (caminho, linhas retas) igual.
- **Causa 2** (`lean`/`onStairs` em `fisica-visao.js`): o "debruçar na mureta" (+0,45 m na arma quando 1,5 m acima do alvo) valia na escada e erguia a arma acima da parede. Agora não vale na escada (vale no terraço/telhado como antes).
- Muretas do terraço: 0,95 m → 0,60 m (`js/mapa/casa.js`).
- Dentro/atrás da casa a laje e as muretas de cima ficam 20% visíveis em vez de sumir (`js/jogo/camera-hud.js`) — quem está no telhado não parece flutuar.
- Teste geral (pares perto de casa, barracão, bunker e caixas, totalmente escondidos atrás de parede em todas as alturas): tiros que varavam 25 → 13 de ~2.800. Os que restam são, em maioria, o tiro do terraço para baixo rente à parede (comportamento antigo do terraço) e frestas finas. Escada → fora da casa: não vara mais. No degrau mais alto, quem está embaixo do piso de cima ainda acerta os pés de quem está na escada (os pés ficam mesmo visíveis pela abertura).
- Tiro no morro (mira na imagem do bot): 97% de acerto, igual a antes. Mata-mata e BR rápidos sem erros.

## Terraço: mureta protege quem está a até 3 m da casa
- `roofBlocked`/`parapetPoint` em `js/base/fisica-visao.js` (usado em `shootRay` de `soldados.js` e em `canShoot`): quem está no terraço não acerta quem está no chão, fora da casa, a menos de 3 m da parede — a bala bate na mureta. Vale nos dois sentidos (quem está embaixo rente à casa também não acerta quem está no terraço). A partir de 3 m, tudo igual a antes.
- Teste: terraço → alvo a 0,5/1,5/2,9 m: 0 acertos (antes 10/10 a 1,5 e 2,9 m); 3,5 e 6 m: 10/10. Tiro no morro 97% igual. Mata-mata e BR rápidos sem erros.
- Mureta no barracão: feita depois (ver abaixo).

## Escada: tiro de fora pela parede leste e teto dentro da casa
- **Teto** (`js/jogo/camera-hud.js`): a laje e as muretas de cima ficam 15% visíveis (20% → 45% tampava a visão; ficou 15%) quando se está dentro/atrás da casa, **inclusive na escada até pisar no terraço** (antes a laje voltava a ficar sólida nos últimos 20% da subida).
- **Tiro na escada** (`stairCut`/`inStairwell` em `js/base/fisica-visao.js`, dentro de `roofBlocked`): quem está na escada (inclusive o último degrau) e quem está no chão fora da casa não se acertam — a bala bate na parede leste (`parapetPoint`). Causa: o último trecho do tiro "dobrado" corria na altura do peito de quem estava no alto da escada e passava por cima da parede/mureta. Quem está dentro da casa continua acertando quem está na escada.
- Teste (atiradores em volta da casa sem linha reta até o alvo, alvo em 11 pontos da escada, 3 tiros cada): acertos 82 → 0. De dentro da casa: continua acertando. Partida rápida sem desenhar a tela: sem erros.
- **Cache do navegador** (`prototipo/index.html`): os arquivos do jogo agora carregam com `?v=<hora>`, então o navegador sempre pega a versão nova depois de uma atualização (antes podia continuar com arquivos antigos guardados). `ferramentas/montar_artifact.py` ajustado para o novo `index.html` (artifact gerado igual).

## Teto que não ficava transparente + mureta no barracão
- **Causa real do teto sólido** (`js/jogo/camera-hud.js`): a laje começava como material sólido; ao entrar na casa o jogo trocava para transparente mas sem `needsUpdate`, e a placa de vídeo continuava desenhando sólido. Só funcionava se o jogador já começasse dentro da casa (por isso os testes anteriores passavam). Agora, ao trocar, marca `needsUpdate`. Teste começando fora e entrando (celular deitado e em pé): antes teto sólido, agora 15% visível.
- **Mureta no barracão** (`js/mapa/bunker-barracao.js`): 0,6 m em volta do telhado, com abertura de 1,8 m na escada de mão; some junto com o telhado quando se está dentro/atrás do barracão.
- **Tiro no barracão** (`barnCut`/`onBarnRoof` em `js/base/fisica-visao.js`, dentro de `roofBlocked`; ponto de impacto em `parapetPoint`): mesma regra da casa — telhado ↔ chão a até 3 m do barracão não se acertam. Teste: 0,5/1,5/2,9 m → 0 acertos (antes 2,9 m acertava 10/10); 3,5 e 6 m → 10/10 igual.
- Escada da casa continua 0 acertos de fora; partida rápida sem erros.

## Menu novo (lobby), sons novos e música
- **Escada de mão do barracão** (`updateZip` em `js/mapa/tirolesa-metralhadoras.js`): o personagem fica sempre de frente para os degraus, subindo e descendo (antes descia de costas para a escada).
- **Faca** (`stab` em `js/personagens/soldados.js`): golpe no vazio não deixa mais risco no chão (só em parede/caixa; sangue no acerto continua).
- **Menu (lobby)** (`index.html`, `css/estilo.css`, final de `js/jogo/menu.js`): estilo jogo de celular — nível/XP e estatísticas no topo, botões à esquerda (CLASSE, ROUPA, ACESSÓRIO) e à direita (BOTS, CLIMA, COMO JOGAR), personagem 3D girando no centro (cena própria `hero`, mostra classe/roupa/acessório escolhidos), MODO e JOGAR embaixo à direita. Cada botão abre uma janela (`#lbSheet`) com as mesmas opções de antes (`.opts[data-group]`, a lógica não mudou). Fonte "Lilita One" (Google Fonts). `renderCareer` chama `lobbyRefresh`.
- **Sons novos** (`sons/*.mp3` embutidos em `sons/sons.js`, 35 sons): do ElevenLabs — porta abrir/fechar, aterrissar, escada, dano (gemido; morte = mesmo som mais grave), zunido de bala, derrota, drone, quique da granada, bandeira, metralhadora fixa. Sintetizados (script, sem ElevenLabs): `musica` (menu, 33 s em laço), `vitoria`, `clique`. No ElevenLabs conectado não tem música (só a versão completa do conector); 7 pedidos falharam por "serviço grátis ocupado" e foram feitos sintetizados.
- Onde tocam: porta (`portas.js`), queda/paraquedas (`physics` em `soldados.js`), escada (`loot.js`), dano/morte (`estado.js`), zunido quando bala inimiga passa a 0,35–2,2 m da cabeça e cápsulas caindo depois do tiro (`soldados.js`, só som — lógica do tiro igual), quique (`granadas.js`), metralhadora fixa (`useTurret`), bandeira (`bandeira.js`), vitória/derrota (`showBoard` em `loop.js`), clique em botões do menu (`menu.js`). Contínuos a cada quadro (`loopSounds` em `loop.js`): drone no ar e chiado da tirolesa. Motor do veículo ganhou ronco grave (`engineStart` em `veiculos.js`).
- Funções novas em `js/base/efeitos-som.js`: `sfxAt` (som num ponto: distância/abafado/lado), `loopSet`, `zipSound`, `shellSound`, `updateMusic` (música só com o menu aberto, some devagar ao jogar), `endJingle`, `uiClick`. Configurações: novo controle **Música do menu** (`cfg.mus`, `CFG_PADRAO`).
- Teste (sem desenhar a tela, tempo acelerado): 35 sons carregam; música toca no menu e vai a 0 na partida; descendo a escada o ângulo fica igual ao da subida (de frente); faca no vazio = 0 marcas; zunido toca com bala a 0,4–1,2 m e não a ~4,5 m; Mata-mata 120 s sem erros. Menu conferido em tela de PC e de celular deitado.

## Som do avião e sons de dano
- **Avião sem som:** no 1º clique em JOGAR o áudio ainda estava carregando e o som do avião era pulado. Agora `startPlaneSnd()` (`js/modos/battle-royale.js`) tenta de novo a cada quadro enquanto o jogador está no avião (volume 0,5).
- **Acerto (`sons/acerto.mp3`):** trocado por um "tic" curto e baixo do ElevenLabs (0,16 s); volume 0,35 e no máximo 1 a cada 0,07 s.
- **Levar dano (`sons/dano.mp3`):** o gemido virou um baque abafado do ElevenLabs (0,28 s); volume 0,3, no máximo 1 por segundo (`js/jogo/estado.js`).
- **Morte:** o gemido antigo foi guardado como `sons/morte.mp3`, tocado mais baixo (0,35 jogador / 0,25 outros).

## Gemido 10%, tela cheia automática e aviso de girar
- Gemido de morte em volume 0,1 (`js/jogo/estado.js`).
- Celular: o 1º toque em qualquer lugar já coloca em tela cheia e trava na horizontal (Android) — `autoFS()` em `js/modos/bomba.js`.
- Botão ⛶ pequeno e meio transparente no topo, no centro: só aparece em tela cheia e serve para sair.
- Celular em pé: aviso discreto "↻ Gire o celular" embaixo (iPhone não deixa travar a rotação).
- Modo app (manifesto / ícone na tela inicial) ficou para depois.

## Tiro atravessando a escada + botão de tela cheia no menu
- **Escada:** os degraus eram só visuais (`solid: false`), então a bala passava por baixo da escada e acertava quem estava no térreo, no cômodo norte (sob a laje). Agora os degraus bloqueiam tiro (`js/mapa/casa.js`). Testado: subir/descer a escada e da escada para o terraço continuam funcionando; a única linha livre restante é a da porta no pé da escada (aberta de verdade).
- **Menu:** botão ⛶ de tela cheia ao lado da caveira/troféu (em jogo continua sutil no topo e só em tela cheia).

## Battle Royale: Base Militar, itens flutuantes, baús fora do minimapa (parte 1 de 2)
- **Base Militar** (`js/mapa/base-militar.js`; lugar sorteado em `js/base/terreno-cena.js` → `MIL`, chão plano): quadrado de 30 m no anel de fora (63–70 m do centro), muro de 2,3 m com 2 portões, **torre de vigia** (5 m, escada de mão + **tirolesa** que desce por cima do muro para o lado do centro do mapa), 2 barracas, 2 contêineres, **caminhão quebrado** (só enfeite), sacos de areia, barris e caixas. **6 baús + 10 itens soltos** com tabela melhor (mais AWP/metralhadora/AK/M4, colete e capacete). Escrito **BASE** no minimapa. Os objetos sorteados do anel não caem dentro dela (`inMil` em `objetos.js`).
- **Queda:** a rota do avião passa sempre a até ~12 m da base; ~1 em cada 3 bots pula nela (`battle-royale.js`).
- **Itens flutuantes** (`js/itens/loot-flutuante.js`): 35 itens soltos pelo mapa (colete, capacete, arma, kit médico, munição), girando com anel brilhante; botão PEGAR; bots pegam igual aos baús; não voltam. Sorteados a cada partida em `startBR` (`spawnFloats`). O nome aparece quando o jogador está a menos de 9 m.
- **Minimapa:** baús não aparecem mais (airdrop continua).
- Só no Battle Royale; os outros modos não mudaram (testado no Mata-mata).
- Testado a toda velocidade: 3 mapas, bots caem na base, ninguém preso no muro, pegar item, subir na torre e descer pela tirolesa, sem erros.
- **Próximo (parte 2, combinado com o usuário):** sortear também casa, barracão e bunker no BR, com distância mínima (~40 m) entre eles e a base. Exige trocar coordenadas fixas por "posição do prédio + distância" em vários arquivos, inclusive `js/base/fisica-visao.js` (só os números, a regra do tiro fica igual) — **pedir autorização antes**.

## 08/11/2026 — Câmera justa (80° + cantos cortados)
- Problema: câmera a 57° via 9,8 m para cima e 7,2 m para baixo; quem ficava em cima na tela do outro era visto antes (41% da área só um via o outro).
- Testados 57°, 70°, 80° e 90° (com jogador deslocado na tela para igualar cima/baixo). Mexer na posição do personagem não resolve os cantos (perspectiva = trapézio).
- Escolhido: 80° (`CAM_OFF` 0, 20.47, 4.06, lookAt 0,0,0.45) + `fairView`: inimigo (e sombra) escondido se o ponto espelhado não cabe na tela. Resultado: 0% de vantagem.
- Ajuste: quando o inimigo fica escondido pelo corte, a barra de vida, a seta de borda e o ponto no minimapa também somem (antes só o boneco sumia). Seta só aparece se os dois lados estiverem fora da tela um do outro.
