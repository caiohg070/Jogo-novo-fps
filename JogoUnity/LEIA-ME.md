# JogoUnity — versão Unity do jogo tático (etapa 1: base)

Decisões do jogo: `../RESPOSTAS_UNITY.md` e `../ESTADO_DO_PROJETO.md`. Este arquivo explica **como o código é organizado**.

## Instalar (uma vez)
1. **Unity Hub** → instalar a **Unity 6 LTS** mais nova, com os módulos **Android Build Support** (OpenJDK + SDK/NDK).
   iOS fica para depois (precisa de Mac).
2. **Blender** (versão estável mais nova) e **Git LFS** (`git lfs install`).
3. Ativar a licença (Personal, grátis) abrindo o Unity Hub uma vez com a sua conta.
4. Abrir o projeto: Unity Hub → *Add project from disk* → esta pasta `JogoUnity`. Na 1ª vez ela baixa os pacotes
   (`Packages/manifest.json`); se pedir para atualizar a versão de algum pacote, pode aceitar.
5. Pela linha de comando (PowerShell, dentro de `JogoUnity`):
   - `.\ferramentas\unity.ps1 cena` → cria a cena `Assets/_Jogo/Cenas/Greybox_BR.unity`
   - `.\ferramentas\unity.ps1 testes` → roda os testes e mostra o resumo
   - Feche o editor antes de rodar comandos pela CLI (a Unity não abre o mesmo projeto duas vezes).
6. Abrir a cena `Greybox_BR` e apertar **Play**: cápsula andando (WASD/controle), mirando com o mouse,
   mapa de morros e prédios cinza gerado pela seed `12345`.

## Regras do código (para não ter retrabalho)
- **Servidor autoritativo desde o dia 1.** A partida roda no `Simulador` (C# puro, sem Unity), em ticks fixos de 30/s.
  O celular só manda `Comando` (joystick, mira, botões). Offline o Simulador roda no celular; online o mesmo código
  roda no servidor dedicado. Vida, dano, munição e posição **só** o Simulador muda.
- **Tela separada da regra.** `Apresentacao` só lê o estado e desenha (com interpolação). Física da Unity não decide
  nada de jogo (colisão e tiro são da simulação, como no protótipo: círculo × caixas, hitscan).
- **Seed para tudo que é sorteado** (mapa, loot, zona, airdrop): sempre `Aleatorio`, nunca `UnityEngine.Random`.
- **Mapa do BR em blocos de 50 m** (800×800 m = 16×16 blocos), cada bloco gerado sozinho a partir da seed;
  só os blocos perto ficam ativos. Morros: altura máx. = 2 andares, sem degraus (inclinação ≤ 0,25), chão plano
  em volta das construções. Construções só em ângulos de 90°.
- **Números do jogo** em `Regras.cs` (um lugar só). Armas e itens vão em ScriptableObjects (`Dados/`) na etapa 3.
- **Sem mira automática.** Entrada vira `Comando`; toque, teclado e controle Bluetooth geram o mesmo Comando.
- **Textos** do menu/HUD sempre por chave de tradução (pt e en), nunca escritos direto no código.
- **Visual troca, regra fica:** greybox agora; os modelos do Blender entram trocando só a parte de `Apresentacao`.

## Pastas
| Pasta | O que tem | Usa Unity? |
|---|---|---|
| `Scripts/Nucleo` | `Regras`, `Aleatorio` (seed), `Vetor2` | não |
| `Scripts/Mapa` | `GeradorMapa`, `BlocoMapa`, `Construcao` | não |
| `Scripts/Simulacao` | `Simulador`, `Comando`, `EstadoJogador` | não |
| `Scripts/Apresentacao` | `Partida` (liga tudo), `CameraTatica` (75°), `VisualMapa`, `EntradaLocal` | sim |
| `Editor` | `CLI` (comandos para `-executeMethod`) | editor |
| `Testes/EditMode` | testes automáticos (seed, mapa, morros, velocidade) | editor |
| `Modelos`, `Animacoes`, `Sons`, `Texturas`, `Materiais`, `Prefabs`, `Cenas`, `Dados` | arquivos do jogo | — |

## Próximas etapas
2. Colisão com prédios, tiro hitscan, bots simples, controles de toque, HUD básico.
3. Armas (ScriptableObjects), acessórios, granadas, personagem animado (camadas + Animation Rigging).
4. BR completo: avião/paraquedas, zona, loot, Base Militar, cidades no gerador.
5. Visual (Blender) e sons. 6. Online (servidor dedicado) e anti-cheat.
