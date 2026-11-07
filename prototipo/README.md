# Protótipo — navegador

Protótipo jogável do `novojogo.md`. Sem assets pagos: modelos, cores e sons são provisórios.

## Como abrir
Abra `index.html` no navegador (precisa de internet para baixar o Three.js).
Na tela inicial escolha **modo**, **classe** e **clima**.

## Modos
- **Treino:** você contra 2 bots.
- **Mata-mata (3 vs 3):** você + 2 aliados (CT e médico) contra 3 inimigos; primeiro time a 20 abates vence.
- **Battle Royale:** 8 jogadores (todos contra todos). Todos começam no avião; toque SALTAR quando quiser e
  guie o paraquedas com o joystick. Começa só com pistola e faca — armas e colete nos baús. A zona azul fecha;
  fora dela você perde vida. Último vivo vence.
- **Bomba:** 3 vs 3 por rodadas (sem renascer). Você leva a bomba: plante no **A** (barracão) ou **B** (oeste)
  ficando parado 3 s; ela explode em 35 s. Os CTs tentam desarmar (5 s). Primeiro a 5 rodadas vence.

## Classes
| Classe | Primária | Secundária | Granadas | Extra |
|---|---|---|---|---|
| Terrorista | AK-47 | Desert Eagle | HE + flash | — |
| CT | Colt M4 | Pistola | flash + smoke | colete 60 + capacete |
| Médico | Colt M4 | Pistola | 2 smoke | cura +40 em você e aliados a 5 m (recarga 18 s), cruz vermelha na mochila |
| Sniper | AWP | Desert Eagle | flash + smoke | — |

## Armas
AK-47, Colt M4, AWP (segure para mirar, solte para atirar; 1 tiro mata sem colete; com colete + capacete precisa de 2), Desert Eagle, pistola, faca.
Granadas: HE (explode, dano em área), flash (cega quem olha), smoke (bloqueia a visão dos bots).

## Loot
Baús verdes (amarelo no minimapa): chegue perto, toque ABRIR (F no PC), veja o item e toque PEGAR. Itens: colete, capacete, kit médico, munição,
arma (AK/M4/AWP) ou granada. Reabrem em 30 s. Os bots também pegam.

## Mais recursos
- **Dificuldade dos bots:** fácil, médio ou difícil (tempo de reação, mira e dano).
- **Andar devagar:** botão ANDAR (celular) ou Shift (PC). Metade da velocidade, mira mais firme e sem barulho de passos.
  Correndo, os bots inimigos perto ouvem seus passos.
- **Minimapa com sons:** tiros inimigos aparecem como círculo vermelho; passos de inimigos perto, como pontinho amarelo.
- **Economia no modo Bomba:** cada rodada começa só com a pistola; dinheiro por vitória ($3250), derrota ($1900),
  abate ($300) e plantar ($300). Botão COMPRAR (ou B) nos primeiros 15 s.
- **Kits médicos:** o baú dá um kit; use no botão KIT (ou E) — leva 2,5 s e cura 45. Atirar cancela.
- **Caixotes de madeira quebram** com tiros ou granada HE.
- **Bunker subterrâneo** a leste (rampa do lado leste, teto some quando você entra, baú dentro).
- **Placar final** com abates, mortes e dano no fim de cada partida (mata-mata, bomba e battle royale).

## Clima
Dia, chuva (chão molhado, poças) e noite com chuva (postes acesos).

## Controles
- **Celular:** joystick anda; botão vermelho: segure e arraste para mirar (já atira), toque rápido mira sozinho;
  botão de granada: segure, arraste e solte; lista à direita troca arma (o 4 troca o tipo de granada);
  botão CURA (médico); RECAR.
- **PC:** WASD, mouse mira, clique atira, 1/2/3 armas, 4 troca granada, G joga, E cura, R recarrega, roda troca arma.

## Ainda falta (próximas etapas)
casas de 3 andares,
modelos 3D melhores dos personagens, sons reais (ElevenLabs) e imagens (Higgsfield/Magnific).

## Sons
Efeitos gerados no ElevenLabs, em `sons/` (mp3) e embutidos em `sons/sons.js`: tiros de AK-47, Colt M4, AWP,
Desert Eagle e pistola, faca, recarga, explosão (HE e bomba), flash, smoke, passos, chuva e bipe da bomba.
Também: avião, paraquedas, plantar/desarmar bomba, abrir baú, pegar item, arma sem bala, sacar arma e acerto no inimigo.
Tiros distantes ficam mais baixos e abafados. Os mesmos mp3 servem para a versão Unity.

## Jogar pelo navegador (GitHub Pages)
1. No GitHub: **Settings → Pages**.
2. Em *Build and deployment*: Source = **Deploy from a branch**; Branch = `claude/save-game-files-repo-rdk6pf`, pasta **/ (root)** → **Save**.
3. Em 1–2 minutos o jogo fica em `https://caiohg070.github.io/jogo-novo-fps/` (o `index.html` da raiz leva para `prototipo/`).
Obs.: Pages grátis só em repositório público.
