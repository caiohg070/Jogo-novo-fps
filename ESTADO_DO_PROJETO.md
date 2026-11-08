# Estado do projeto (resumo atual)

Última atualização: 08/11/2026. Histórico completo de cada chat: `HISTORICO.md` (só abrir se precisar).

## Links
- Site: https://caiohg070.github.io/Jogo-novo-fps/ · Artifact: https://claude.ai/artifact/45WY4Ec1HckFaMj5SCsgEC
- Sons no ElevenLabs: flow "Jogo tático - efeitos sonoros" (`HB0RnWHvUUjmllWHYXRE`).

## Técnica (essencial)
- `prototipo/index.html` (HTML) + `css/` + `js/` (ordem em `js/arquivos.js`). Sons em base64: `sons/sons.js`.
- Câmera perspectiva fixa a 75° (quase de cima, vê o mesmo tanto para cima e para baixo) + "cantos cortados":
  inimigo (boneco, vida, seta e minimapa) só aparece se ele também te veria (`fairView` em `camera-hud.js`), justo para quem está em cima ou embaixo.
  Personagens 3D de caixas, física própria (círculo × caixas).
- Tiro hitscan: acerto 2D (`HIT_R`), bloqueio 3D com `shotBlock` em 3 trechos. Regras especiais em
  `js/base/fisica-visao.js`: `roofBlocked`/`parapetPoint` (terraço e telhado do barracão: chão a < 3 m não acerta),
  `stairCut` (escada × fora da casa), `lean` (não vale na escada). Transparência de parede não afeta tiro.
- Bots: A* em `js/inimigos/navegacao.js` (porta aberta conta como parede), IA em `ia-bots.js`.
- Ganchos de teste no `window`: `__game`, `__los`, `__cs`, `__die`, `__bomb`, `__zone`, `__jump`, `__sfx`, `__ts`, `__nav`.

## O que o jogo tem
- Modos: Treino, Tutorial (13 passos), Mata-mata 3×3, Bomba 3×3 (loja/economia), Bandeira 3×3 (8 min), Battle Royale 8 jogadores.
- Classes: Terrorista, CT, Médico, Sniper. Armas: AK, M4, AWP, Deagle, pistola, faca, escopeta, SMG, LMG; silenciador.
  Granadas: HE, flash, smoke, molotov, mina. Drone, colete/capacete, kits, caído/reanimar.
- Mapa: casa 2 andares (terraço, escada), barracão (telhado + escada de mão), bunker, cabanas, portas, vidro, mato,
  veículos, tirolesa, metralhadora fixa (só Bandeira). Climas: dia, chuva, noite, neblina.
- BR: mapa 180 m sorteado (recarrega a página com semente), avião/paraquedas, zona, airdrops, **Base Militar** sorteada
  (`js/mapa/base-militar.js`, `MIL`), 35 itens flutuantes, baús fora do minimapa. Outros modos: mapa fixo 116 m.
- Menu lobby com personagem 3D, XP/níveis, configurações, histórico no aparelho, música e 35 sons.

## Próximo passo
- **Parte 2 do BR:** sortear casa, barracão e bunker no BR (distância mínima ~40 m entre eles e a Base). Autorizado trocar
  em `fisica-visao.js` só os números fixos por "posição do prédio + distância", sem mudar a regra do tiro. Outros modos fixos.

## Pendências
- Bots não dirigem veículos, não usam metralhadora fixa nem tirolesa; passageiro não atira do jipe.
- Possível bug: bot parado em "engage" sem inimigo (tem proteção, não reproduzido).
- Desempenho do BR em celular fraco não medido. Som da chuva curto (2 s).
- Depois: Modo Zumbi, online (PeerJS), modo app. Plano final: migrar para Unity.
- O usuário **não quer**: besta, barris explosivos, camuflagem afetando visão dos bots.

## Versão Unity (planejamento)
- Decisões em `RESPOSTAS_UNITY.md` (questionário em `QUESTIONARIO_UNITY.md`). Parte 2 do BR (sortear prédios) ficou para depois.
