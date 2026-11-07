# Estado do projeto — Jogo tático top-down

> **Para continuar em um novo chat:** cole este arquivo (ou peça para o Claude ler `ESTADO_DO_PROJETO.md`
> e `novojogo.md` do repositório `caiohg070/jogo-novo-fps`, branch `claude/save-game-files-repo-rdk6pf`).
> **Regra do projeto:** sempre perguntar antes de iniciar algo grande ou gastar créditos (ElevenLabs/Higgsfield/Magnific).

Última atualização: 07/11/2026.

---

## 1. Onde está tudo

| O quê | Onde |
|---|---|
| Documento de ideias original | `novojogo.md` |
| Imagens de referência (ref01–ref08) | `referencias/` |
| **Jogo (protótipo no navegador)** | `prototipo/index.html` (arquivo único, ~2150 linhas) |
| Sons (mp3 do ElevenLabs) | `prototipo/sons/*.mp3` |
| Sons embutidos (base64) usados pelo jogo | `prototipo/sons/sons.js` (gerado a partir dos mp3) |
| Manual do protótipo (controles, modos) | `prototipo/README.md` |
| Página raiz para GitHub Pages (redireciona p/ `prototipo/`) | `index.html` + `.nojekyll` |
| Jogo publicado (para testar no celular) | https://claude.ai/artifact/45WY4Ec1HckFaMj5SCsgEC |
| Sons no ElevenLabs | flow "Jogo tático - efeitos sonoros" (id `HB0RnWHvUUjmllWHYXRE`) |
| Branch de trabalho | `claude/save-game-files-repo-rdk6pf` (é a única branch; não existe `main`) |

**Como abrir localmente:** abrir `prototipo/index.html` no Chrome (precisa de internet para baixar o Three.js da CDN).

**Como publicar o artifact de novo:** o artifact não aceita `<html>/<head>/<body>` nem arquivos externos;
o script usado gera uma cópia sem essas tags e troca `<script src="sons/sons.js">` pelo conteúdo inline de `sons.js`.

**GitHub Pages (ainda não ativado pelo usuário):** Settings → Pages → Deploy from a branch →
`claude/save-game-files-repo-rdk6pf` / root → Save. Endereço: `https://caiohg070.github.io/jogo-novo-fps/`.
Precisa estar logado no GitHub no Chrome (repo privado dá 404) e Pages grátis só em repositório público.

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

---

## 4. O que falta / próximos passos

**Pendências pequenas no protótipo**
- [ ] Sons que falharam por fila do ElevenLabs: puxar pino da granada, alicate de desarme, bala no concreto, caixote quebrando.
- [ ] Som da chuva tem só 2 s (repete); gerar um mais longo se incomodar.
- [ ] Usuário ainda não ativou o GitHub Pages (ver seção 1).
- [ ] Bots não usam navegação de verdade (andam em linha reta entre pontos; destravam com "detour"). Em mapas novos podem enroscar.
- [ ] Mapa maior vale para todos os modos (nos modos 3×3 o anel externo fica pouco usado).

**Do documento `novojogo.md` ainda não feito**
- [ ] Casas/sobrados de **3 andares** (decidido: fazer direto na Unity).
- [ ] Visual realista das referências (texturas, sombras, interiores) — decidido: **não** investir no protótipo, fazer na Unity.
- [ ] Imagens geradas (Higgsfield/Magnific, sprite sheets) — não necessárias agora (sem sprites 2D).
- [ ] Multiplayer online (o documento pede começar sem).
- [ ] Empacotar para Play Store (Capacitor) **ou** migrar para **Unity** (plano principal do usuário).

**Plano combinado**
1. Usuário aprova a jogabilidade no protótipo.
2. Migrar para **Unity** (usuário tem notebook): Claude escreve os scripts C#, usuário abre o projeto/clica Play/gera APK.
   Reaproveitar: números de `WEAPONS`/`CLASSES`/`DIFF`, regras de cobertura e terraço, IA dos bots, modos, mapa (posições), sons de `prototipo/sons/`.

---

## 5. Como pedir mudanças no próximo chat (sugestão)

> "Leia `ESTADO_DO_PROJETO.md` e `novojogo.md` do repositório caiohg070/jogo-novo-fps (branch
> claude/save-game-files-repo-rdk6pf). Continue o protótipo em `prototipo/index.html`.
> Depois de cada mudança: testar, fazer commit/push na mesma branch e republicar o artifact
> https://claude.ai/artifact/45WY4Ec1HckFaMj5SCsgEC."
