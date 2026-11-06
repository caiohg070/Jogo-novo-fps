# Ideias do jogo — documento de projeto

> Cole este arquivo + as 8 imagens de referência no início de um novo chat.
>
> **Regra:** sempre perguntar antes de iniciar a criação do jogo ou qualquer alteração.

## 1. Plataforma e tecnologia
- Começar no navegador (Three.js, mapa 3D real) e depois empacotar para a Play Store (Capacitor).
- Sem multiplayer no início: só o jogador contra bot para testes.
- Unity fica como possibilidade futura (o usuário tem notebook) se quiser mais qualidade gráfica.
- Testar no celular pela Unity: Unity Remote (cabo USB) ou gerando APK.

## 2. Câmera e visual
- Câmera fixa, de cima, levemente inclinada, estilo Brawl Stars — não se move de ângulo.
- Mapa 3D com profundidade: relevo, morros, montanhas, ruas mais altas e mais baixas.
- Personagens: ~~sprites 2D~~ — decidido: não precisa mais de sprites 2D; personagens continuam em 3D.
- Visual realista tático, seguir EXATAMENTE as referências (Door Kickers 2 / Thunder Tier One):
  tons de terra, poeira e concreto, sombras longas, telhados cortados mostrando o interior das casas,
  variação noturna com chuva e poças.

## 3. Mapa
- Casas e sobradinhos de 1, 2 ou 3 andares, com parte de cima/último andar onde dá para ficar de AWP.
- Áreas subterrâneas onde o personagem pode entrar.
- Props: carros destruídos, caminhão militar, sacos de areia, barreiras de concreto, caixotes,
  contêineres, tubos de concreto, entulho, postes, cercas, vegetação seca.
- Efeito de chuva.

## 4. Modos de jogo (escolhidos ao abrir o jogo)
- **Battle Royale** — todos caem de avião/paraquedas e o jogador escolhe onde cair.
- **Mata-mata** (team deathmatch).
- **Plantar a bomba** — igual ao Counter-Strike (plantar/desarmar).

## 5. Armas e equipamentos
- AK, Colt (M4), faquinha, pistola, Desert Eagle, AWP (mata com 1 tiro, no máximo 2).
- Granadas: bomba/HE, smoke, flash.

## 6. Classes (4 iniciais)
- Terrorista
- Contra-terrorista (CT)
- Médico (cruz vermelha na mochila, cura)
- Sniper / AWP

## 7. Controles (igual Brawl Stars)
- Lado esquerdo: joystick para andar.
- Lado direito: botão fixo — aperta e arrasta para mirar; ao apertar já começa a atirar
  automaticamente (não precisa de botão separado de tiro).

## 8. HUD
- Vida, munição, armas, granadas no estilo Counter-Strike (pode usar CS como referência).
- Minimapa, contador de jogadores restantes no BR (ver ref03).

## 9. Sons — ElevenLabs (já conectado)
- Tiro da AK, Colt, pistola, Desert Eagle, AWP, corte da faca, explosão da bomba,
  smoke, flash, chuva, passos etc.
- Devem ser bem realistas, como no jogo Bodycam.

## 10. Imagens — Higgsfield ou Magnific (economizar créditos)
- Gerar vários elementos na mesma imagem (ex.: várias árvores, vários caixotes numa folha só)
  e recortar depois (sprite sheet), em vez de uma geração por item.

## 11. Primeiro passo combinado
Protótipo jogável no navegador: mapa pequeno com relevo + uma casa de 2 andares, personagem com
controles estilo Brawl Stars (mira já atira), um bot inimigo e a AK. Sem gastar créditos;
imagens e sons entram depois que a jogabilidade for aprovada.

## Referências (pasta `referencias/`)
- [ref01 — cidade deserto top-down](referencias/ref01-cidade-deserto-topdown.jpg)
- [ref02 — personagem frente/costas](referencias/ref02-personagem-frente-costas.jpg)
- [ref03 — conceito HUD/modos/classes](referencias/ref03-conceito-hud-modos-classes.png) (outra versão: [ref03b](referencias/ref03b-conceito-hud-modos-classes.jpg))
- [ref04 — noite com chuva](referencias/ref04-noite-chuva.jpg)
- [ref05 — casa com telhado cortado e chuva](referencias/ref05-casa-telhado-cortado-chuva.jpg)
- [ref06 — Thunder Tier One (dia, pátio industrial)](referencias/ref06-thunder-dia-patio-industrial.jpg)
- [ref07 — Thunder Tier One (dia, rua com chuva)](referencias/ref07-thunder-dia-rua-chuva.jpg)
- [ref08 — Thunder Tier One (rua, entardecer)](referencias/ref08-thunder-rua-entardecer.jpg)
