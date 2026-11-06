# Protótipo — navegador

Protótipo jogável do `novojogo.md`. Sem assets pagos: modelos, cores e sons são provisórios.

## Como abrir
Abra `index.html` no navegador (precisa de internet para baixar o Three.js).
Na tela inicial escolha **modo**, **classe** e **clima**.

## Modos
- **Treino:** você contra 2 bots.
- **Mata-mata (3 vs 3):** você + 2 aliados (CT e médico) contra 3 inimigos; primeiro time a 20 abates vence.
- Battle Royale e Bomba: em breve.

## Classes
| Classe | Primária | Secundária | Granadas | Extra |
|---|---|---|---|---|
| Terrorista | AK-47 | Desert Eagle | HE + flash | — |
| CT | Colt M4 | Pistola | flash + smoke | colete 60 + capacete |
| Médico | Colt M4 | Pistola | 2 smoke | cura +40 em você e aliados a 5 m (recarga 18 s), cruz vermelha na mochila |
| Sniper | AWP | Desert Eagle | flash + smoke | — |

## Armas
AK-47, Colt M4, AWP (1 tiro mata sem colete; com colete + capacete precisa de 2), Desert Eagle, pistola, faca.
Granadas: HE (explode, dano em área), flash (cega quem olha), smoke (bloqueia a visão dos bots).

## Loot
Caixas verdes (amarelo no minimapa) dão ao passar por cima: colete, capacete, kit médico, munição,
arma (AK/M4/AWP) ou granada. Reabrem em 30 s. Os bots também pegam.

## Clima
Dia, chuva (chão molhado, poças) e noite com chuva (postes acesos).

## Controles
- **Celular:** joystick anda; botão vermelho: segure e arraste para mirar (já atira), toque rápido mira sozinho;
  botão de granada: segure, arraste e solte; lista à direita troca arma (o 4 troca o tipo de granada);
  botão CURA (médico); RECAR.
- **PC:** WASD, mouse mira, clique atira, 1/2/3 armas, 4 troca granada, G joga, E cura, R recarrega, roda troca arma.

## Ainda falta (próximas etapas)
Battle Royale (avião/paraquedas), modo bomba, áreas subterrâneas, casas de 3 andares,
sprites 2D dos personagens, sons reais (ElevenLabs) e imagens (Higgsfield/Magnific).
