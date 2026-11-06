# Protótipo — Treino vs 2 Bots

Primeiro passo combinado no `novojogo.md` (seção 11): mapa pequeno com relevo, casa de 2 andares
(térreo + terraço), controles estilo Brawl Stars, 2 bots inimigos, AK-47, Colt M4, faca e granada flash. Sem assets pagos —
modelos, cores e sons são provisórios.

## Como abrir
Abra `index.html` no navegador (Chrome/Edge/Safari). Precisa de internet para baixar o Three.js (CDN).

## Controles
- **Celular:** joystick à esquerda anda. Botão vermelho à direita: segure e arraste para mirar —
  já atira enquanto segura. Toque rápido = mira automática no inimigo mais próximo. Botão RECAR. recarrega.
  Botão FLASH: segure, arraste para escolher onde cai e solte (toque rápido joga para a frente).
  Lista de armas à direita: toque para trocar.
- **PC:** WASD anda, mouse mira, segure o clique para atirar, 1/2/3 ou roda do mouse troca de arma,
  G (ou 4) joga flash no ponto do mouse, R recarrega.

## O que tem
- Câmera fixa de cima, levemente inclinada, que só acompanha o jogador.
- Terreno com morros, ruas rebaixadas e montanhas na borda.
- Casa com janelas (tiro passa, corpo não), porta, parede interna, escada e terraço com mureta
  (ponto de sniper). Ao entrar no térreo o terraço some ("telhado cortado"); paredes na frente da câmera ficam transparentes.
- Props: caminhão militar, carros destruídos, contêineres, barreiras, sacos de areia, caixotes, tubos, postes, barris, cercas.
- Armas: AK-47 (dano alto, menos precisa), Colt M4 (mais rápida e precisa, dano menor), faca (2 golpes, anda mais rápido).
- Flash: 2 por vida (+1 por abate). Cega quem vê a explosão; de costas cega bem menos. Paredes bloqueiam.
- Cobertura: o tiro corre na altura do peito perto de quem atira e de quem leva — barreira, sacos de areia,
  caixote e carro protegem quem está colado neles; do terraço dá para atirar por cima da mureta.
- Vida regenera após 4 s sem dano.
- 2 bots (um com AK, outro com M4): patrulham (inclusive o terraço), ouvem tiros, procuram, trocam tiro com
  rajadas e strafe, só atiram com linha livre, flanqueiam cobertura e às vezes jogam flash.
- HUD: vida, munição, minimapa, placar, kill feed, números de dano.

## Próximos passos (a combinar)
Sprites 2D dos personagens, sons ElevenLabs, outras armas/granadas, chuva/noite, modos de jogo.
