# Estado do projeto (resumo atual)

Última atualização: 08/11/2026. Histórico completo de cada chat: `HISTORICO.md` (só abrir se precisar).

## Links
- Site: https://caiohg070.github.io/Jogo-novo-fps/ · Artifact: https://claude.ai/artifact/45WY4Ec1HckFaMj5SCsgEC
- Sons no ElevenLabs: flow "Jogo tático - efeitos sonoros" (`HB0RnWHvUUjmllWHYXRE`).

## Técnica (essencial)
- `prototipo/index.html` (HTML) + `css/` + `js/` (ordem em `js/arquivos.js`). Sons em base64: `sons/sons.js`.
- Câmera perspectiva fixa a 75° (quase de cima, vê o mesmo tanto para cima e para baixo) + "cantos cortados":
  inimigo (boneco, vida e minimapa) só aparece se ele também te veria (`fairView`/`fairPair` em `camera-hud.js`; bots usam a mesma regra para mirar). AWP: câmera só muda enquanto mira (zoom pequeno, 1 m para o lado da mira, som de ferrolho ao carregar), justo para quem está em cima ou embaixo.
  **Faixa dos lados (cantos de cima):** a câmera inclinada vê um trapézio (em cima é mais largo que embaixo). Nos
  cantos de cima sobra uma faixa onde só um jogador veria o outro → ali o inimigo (boneco, sombra, vida, minimapa) fica
  escondido e os bots não miram. Tamanho da faixa: ~9% da tela em 75° (6% em 80°, 0% em 90°). Mudar a posição do
  personagem na tela não resolve (já está no ponto ótimo); só câmera mais reta diminui a faixa.
  A regra é igual para esquerda e direita (testado); diferença de altura muda o limite. Inimigo entra/sai da faixa
  com efeito suave de ~0,3 s (`fadeSoldier` em `camera-hud.js`, clona os materiais do boneco).
  No alto (telhado 3 m) a faixa fica grande (~17% da largura): decidido **manter assim** (100% justo). Alternativa
  guardada para o online: altura não contar na faixa (fica ~4%, mas quem está no alto vê um pouco antes na beirada).
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
- Mira sem nenhuma ajuda (`aimSnap` e `autoAimAngle` desligados em `entrada.js`).
- Otimização fica para a Unity. Decidido: mapa do BR (~800×800 m) **dividido em blocos** (ex. 50×50 m, só os perto
  ficam ativos) e **gerado por seed** (todos geram o mesmo mapa sem baixar; pode gerar enquanto procura partida).
- Anti-cheat (decidido para a Unity): servidor autoritativo (jogador só manda comandos; servidor decide movimento,
  dano, vida, munição); servidor não manda inimigos fora da visão (contra wallhack); checar se ações fazem sentido
  (cadência, velocidade, linha de visão); detectar aimbot por estatística e marcar para revisão; denúncia + replay;
  Easy Anti-Cheat (grátis via Epic Online Services); ranqueada só com nível mínimo/celular verificado.
- Morros (regra para o mapa): altura máxima = altura da casa; sem diferenças bruscas de altura (ex.: nada de partes
  muito baixas perto das casas), terreno suave em volta das construções.
