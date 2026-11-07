# Onde está cada coisa (protótipo)

O jogo foi separado em arquivos. Para mudar algo, abra **só** o arquivo do assunto.
A ordem de carregamento fica em `js/arquivos.js` (um arquivo pode usar o que veio antes dele).

| Assunto | Arquivo |
|---|---|
| Telas, botões, HUD (HTML) | `index.html` |
| Visual dos menus/HUD (cores, tamanhos) | `css/estilo.css` |
| Sons (mp3 embutidos; para trocar/adicionar: ponha o .mp3 em `sons/` e regenere `sons/sons.js`) | `sons/sons.js` |
| Tocar sons, música do menu, sons contínuos | `js/base/efeitos-som.js` |
| Menu inicial (lobby) e personagem 3D do menu | `index.html`, `css/estilo.css`, `js/jogo/menu.js` |
| Funções úteis, regras (vida, dano, armas, classes) | `js/base/utilidades-regras.js` |
| Relevo do chão, luz, renderizador | `js/base/terreno-cena.js` |
| Caixas/paredes e colisão | `js/base/construcao.js` |
| Tiro, linha de visão, física | `js/base/fisica-visao.js` |
| Efeitos (partículas, sangue) e som sintetizado | `js/base/efeitos-som.js` |
| **Mapa:** casa de 2 andares | `js/mapa/casa.js` |
| **Mapa:** caixotes, sacos de areia, árvores, contêineres | `js/mapa/objetos.js` |
| **Mapa:** bunker e barracão | `js/mapa/bunker-barracao.js` |
| **Mapa:** portas | `js/mapa/portas.js` |
| **Mapa:** tirolesa e metralhadoras fixas | `js/mapa/tirolesa-metralhadoras.js` |
| **Mapa:** Base Militar (só Battle Royale; lugar sorteado em `terreno-cena.js`) | `js/mapa/base-militar.js` |
| **Mapa:** clima (chuva, noite, neblina) | `js/mapa/clima.js` |
| **Personagens:** modelo, roupas, acessórios, animação | `js/personagens/soldados.js` |
| **Inimigos/bots:** caminho (A*) | `js/inimigos/navegacao.js` |
| **Inimigos/bots:** comportamento (IA) | `js/inimigos/ia-bots.js` |
| Veículos | `js/itens/veiculos.js` |
| Drone | `js/itens/drone.js` |
| Granadas | `js/itens/granadas.js` |
| Baús de loot | `js/itens/loot.js` |
| Itens soltos flutuando (só Battle Royale) | `js/itens/loot-flutuante.js` |
| Estado do jogo (time, placar, morte, renascer) | `js/jogo/estado.js` |
| Controles (teclado, toque, joystick) | `js/jogo/entrada.js` |
| Câmera, paredes transparentes, HUD | `js/jogo/camera-hud.js` |
| Início de partida | `js/jogo/partida.js` |
| Loop principal (cada quadro) | `js/jogo/loop.js` |
| Tela inicial e tutorial | `js/jogo/menu.js` |
| Modos: Battle Royale / Bomba / Bandeira | `js/modos/battle-royale.js`, `bomba.js`, `bandeira.js` |

**Arquivo novo?** Crie em `js/...` e coloque o nome em `js/arquivos.js` na posição certa.

**Artifact (precisa de um arquivo só):** `python3 ferramentas/montar_artifact.py saida.html` junta tudo e publica `saida.html`.
