# Especificação da base jogável (Unity) — fazer CERTO desde o início

Fonte dos números: protótipo HTML em `Prototipo_Referencia/prototipo/js/` (Three.js). Unidade: 1 = 1 metro.
Decisões de produto: `RESPOSTAS_UNITY.md` (vale mais que o protótipo quando divergir).

## 1. Câmera (copiar exatamente do protótipo)
Arquivos: `base/terreno-cena.js` (linhas ~88-99) e `jogo/camera-hud.js` (`updateCamera`, `onBase`, `fairView`).
- Perspectiva, **FOV vertical 38°**, near 0,5, far 220.
- Câmera **fixa, sem girar**: offset do alvo `CAM_OFF = (0, 20.07, 6.06)` (≈73° de inclinação, ~21 m de distância), olhando para (0, 0, 0.68) relativo ao offset. Alvo = jogador + 0,9 m de altura (jogador no centro da tela).
  - Em Unity (eixo Z do protótipo = "para baixo da tela"): câmera atrás no -Z do Unity; converter com cuidado e validar com screenshot que o enquadramento bate com o protótipo.
- Seguir o alvo com suavização: `lerp(alvo, dt*8)` (killcam: `dt*4`).
- **Escala por proporção de tela** (`camScale`): aspecto < 1 → 1,55; < 1,4 → 1,2; > 1,9 → 1,18; senão 1.
- **Zoom (`camZoom`, lerp dt*3)**: avião 1,5; paraquedas 1,35; veículo 1,25 + |vel|/60; sniper mirando 0,92; acessório mira 1,15; metralhadora fixa 1,2; normal 1.
- Sniper mirando: câmera desliza 1 m para o lado da mira (lerp dt*2).
- Tremor de tela em explosão (`shakeT`).
- Killcam: após morrer, câmera vai até quem matou por ~2 s (de 0,5 a 2,8 s).
- **Visão justa ("fairView")**: câmera base igual para todos (sem zoom). Inimigo só aparece (boneco, sombra, vida, minimapa) se ele também veria você; bots usam a mesma regra para mirar. Faixa dos cantos de cima ~9% da tela; entra/sai com fade de ~0,3 s. No online isso vira regra do **servidor** (não mandar posição de quem não deve ser visto = anti "wallhack").

## 2. Controles (iguais aos de hoje) — `jogo/entrada.js`
- Celular: joystick esquerdo move; joystick direito mira e atira (tiro na direção do analógico). **Sem mira automática** (o protótipo tem `autoAimAngle` ao tocar sem direção — NÃO portar).
- PC/teste: WASD/setas movem, mouse mira (ponto no chão), clique atira, Shift anda devagar.
- Botão "andar" (toggle): metade da velocidade, passos silenciosos.
- Personagem vira para a mira; sem mira, vira para onde anda.
- Atirando com arma de fogo: velocidade × 0,82. Andando devagar: × 0,5.
- Sniper: segurar = mira com linha vermelha; soltar = atira.
- Botões: agachar, correr, recarregar, trocar arma, granada, pular, interagir, mochila, mapa. Layout configurável (posição, inverter, mover). Controle Bluetooth.
- Usar o **Input System** novo com Action Map (Gamepad + Touch + Teclado/Mouse) desde o início.

## 3. Regras do jogador — `base/utilidades-regras.js`, `personagens/soldados.js`
- Vida 100. Regenera 12/s depois de 4 s sem dano. Kit: +45 (canalizado).
- Raio do corpo 0,42; raio de acerto 0,36; altura do tiro 1,0.
- Velocidade vem da arma (AK 5,0; pistola 5,5; faca 6,2; sniper 4,3).
- Passos correndo: bots a < 13 m ouvem (a cada 0,5 s).
- Espalhamento: parado = `spread`; andando = `moveSpread` ou spread×1,7; andando devagar = spread×1,15; acessório mira ×0,8.

## 4. Armas (tabela inicial, ajustar depois)
Base do protótipo (mag, cadência s, dano min-max, spread, alcance m, recarga s, velocidade):
- AK-47: 30, 0,1, 27-36, 0,03, 32, 2,4, 5,0
- (M4 → M16A4/SCAR/FAMAS/ALG derivar do M4/AK)
- AWM/M24 (base AWP): 5, 1,45, 108-122, 0,002 (andando 0,14), 60, 3,6, 4,3, luneta
- Desert Eagle: 7, 0,5, 46-60, 0,022, 28, 2,2, 5,4
- P92 (base pistola): 20, 0,3, 16-22, 0,03, 24, 2,0, 5,5
- Escopetas (base): 6, 0,85, 14-19 ×8 chumbos, 0,08, 15, 2,8, 5,0
- SMGs (base): 30, 0,065, 14-19, 0,026, 26, 1,9, 5,7
- Facas: 0,55, 50-60, alcance 1,8, 6,2
Tiro **hitscan**, com penetração (`pen`). Dados das armas em **ScriptableObjects** (`Dados/`), nunca fixos no código.

## 5. Engenharia (para não refazer)
- Unity 6000.6.8f1, URP, projeto `JogoUnity/`. Alvo: Android 3 GB RAM / 60 FPS; iOS depois.
- **Servidor autoritativo desde o início**: lógica de jogo (vida, dano, munição, tiro, visão justa) separada da apresentação, rodando igual offline (bots) e online. Usar Netcode for GameObjects + servidor dedicado (escolher na hora; deixar camada de rede isolada). Offline = "host local".
- Simulação em passo fixo (tick), input como comando (para predição/reconciliação depois).
- Pastas: `Assets/_Jogo/{Scripts/{Jogador,Armas,Bots,Rede,Modos,Camera,UI},Prefabs,Modelos,Dados,Cenas,Materiais,Audio}`.
- Assembly definitions por módulo. Namespaces `Jogo.*`. Código e comentários em português, consistente.
- Greybox primeiro (formas simples, cores do guia de estilo); visual final depois.
- Testes: EditMode para regras (dano, spread, visão justa); PlayMode para movimento/câmera. Validar com `unity command capture game_view`.
- Tudo configurável por dados; nada de números mágicos espalhados.

## 6. Primeira entrega (escopo da base)
1. Cena de treino: chão 116 m, algumas caixas/paredes greybox.
2. Jogador cápsula com movimento, câmera do item 1, controles do item 2 (teclado/mouse + toque).
3. AK-47 com tiro hitscan, munição, recarga, espalhamento, linha de mira.
4. Alvo/bot simples parado que recebe dano e morre/renasce.
5. HUD mínimo: vida, munição, joysticks.
6. Screenshot comparando enquadramento com o protótipo (`Prototipo_Referencia/tdm.png`, `br.png`).
