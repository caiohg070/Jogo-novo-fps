# Protótipo — Treino vs Bot

Primeiro passo combinado no `novojogo.md` (seção 11): mapa pequeno com relevo, casa de 2 andares
(térreo + terraço), controles estilo Brawl Stars, 1 bot inimigo e a AK-47. Sem assets pagos —
modelos, cores e sons são provisórios.

## Como abrir
Abra `index.html` no navegador (Chrome/Edge/Safari). Precisa de internet para baixar o Three.js (CDN).

## Controles
- **Celular:** joystick à esquerda anda. Botão vermelho à direita: segure e arraste para mirar —
  já atira enquanto segura. Toque rápido = mira automática no inimigo mais próximo. Botão RECAR. recarrega.
- **PC:** WASD anda, mouse mira, segure o clique para atirar, R recarrega.

## O que tem
- Câmera fixa de cima, levemente inclinada, que só acompanha o jogador.
- Terreno com morros, ruas rebaixadas e montanhas na borda.
- Casa com janelas (tiro passa, corpo não), porta, parede interna, escada e terraço com mureta
  (ponto de sniper). Ao entrar no térreo o terraço some ("telhado cortado"); paredes na frente da câmera ficam transparentes.
- Props: caminhão militar, carros destruídos, contêineres, barreiras, sacos de areia, caixotes, tubos, postes, barris, cercas.
- AK-47: 30/90, cadência 600/min, recarga 2,4 s, alcance 32 m. Vida regenera após 4 s sem dano.
- Bot: patrulha (inclusive sobe no terraço), ouve tiros, procura, troca tiro com rajadas e strafe.
- HUD: vida, munição, minimapa, placar, kill feed, números de dano.

## Próximos passos (a combinar)
Sprites 2D dos personagens, sons ElevenLabs, outras armas/granadas, chuva/noite, modos de jogo.
