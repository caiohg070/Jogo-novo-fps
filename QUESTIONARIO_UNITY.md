# Questionário — versão Unity (celular)

Responda embaixo de cada pergunta (pode ser curto). Onde tem **(sugestão)**, se concordar é só escrever "ok".
Pode pular o que não souber agora; dá para decidir depois.

**Já definido por você:**
- Jogo de tiro gratuito para Android (Play Store) e iPhone (App Store), feito na Unity pela CLI/plugin do Claude Code.
- Câmera de cima, um pouco inclinada (como o protótipo atual).
- Modos: Battle Royale (até ~30 jogadores), Bomba e Bandeira.
- Personagem homem e mulher. Skins de CT e de Terrorista.
- Loja com skins de roupa, capacete, mochila, arma e faca, além de pacotes de skins e passe.
- Algumas skins e partes do passe liberadas assistindo propaganda.
- Login com Gmail, Facebook etc. logo ao abrir o jogo.
- Bots completam a partida quando tiver pouca gente.
- Tela de espera mostrando quem está entrando, com as skins.
- No menu, o personagem gira 360° com o dedo.
- Precisa ser leve e otimizado para celular.

---

## 1. Visão geral

1.1 Qual o **nome** do jogo? (precisa estar livre nas lojas)

1.2 Você escreveu "FPS". Hoje o jogo é **visto de cima**. Qual dos dois?
   a) Continua visto de cima, inclinado **(sugestão: é o que já funciona e é mais leve)**
   b) Primeira pessoa (outro jogo, recomeça do zero)
   c) Visto de cima, com um modo de mira mais próximo ao segurar o botão

1.3 Qual a **faixa de idade** do público? (muda as regras de propaganda, de caixas e a classificação nas lojas)
   a) 12+  b) 16+  c) 18+

1.4 Em quais **países** vai lançar primeiro? Só Brasil ou o mundo todo?

1.5 Quais **idiomas**? **(sugestão: português e inglês, com espanhol depois)**

1.6 Qual o **estilo visual**?
   a) *Low poly* colorido (mais leve) **(sugestão)**
   b) Semi-realista
   c) Desenho (*cartoon*)
   Se tiver uma imagem de referência de outro jogo **só para o estilo**, mande.

1.7 Quanto tempo você quer que dure uma partida de cada modo?

1.8 Tem **data ou meta** de lançamento? Vai lançar primeiro um teste fechado (beta)?

1.9 Vai fazer sozinho ou com mais pessoas (artista, programador, alguém para o servidor)?

1.10 Quanto pode gastar por mês com servidor e serviços no começo? (R$ 0, R$ 100, R$ 500, mais)

---

## 2. Celulares e desempenho

2.1 Qual o **celular mais fraco** que precisa rodar bem? (modelo ou ano) **(sugestão: Android com 3 GB de RAM, de ~2020)**

2.2 Meta de **FPS**: 30 fixo ou 60 nos celulares bons? **(sugestão: 30 nos fracos, 60 opcional nos bons)**

2.3 **Tamanho máximo** do download inicial? **(sugestão: até 150 MB; o resto baixa depois dentro do jogo)**

2.4 Quer opções de gráfico (baixo / médio / alto) no menu? **(sugestão: sim, e escolha automática pelo celular)**

2.5 Bateria e aquecimento: aceita limitar o FPS no menu e na tela de espera para economizar? **(sugestão: sim)**

2.6 Vai ter **chuva, névoa e noite** como no protótipo? Nos celulares fracos podem ser desligadas?

---

## 3. Jogabilidade e controles

3.1 Controles de tela: **(sugestão)** joystick esquerdo para andar e direito para mirar, atirando automático ao mirar ou com botão. Qual prefere?
   a) Atira com botão separado
   b) Atira ao soltar o joystick direito
   c) Os dois, escolhendo nas opções

3.2 Botões que precisa ter: agachar, correr, recarregar, trocar arma, granada, pular, interagir (porta/veículo), mochila, mapa. Falta ou sobra algum?

3.3 Vai ter **mira automática leve** (ajuda a acertar no celular)? Liga e desliga nas opções?

3.4 Quer suporte a **controle** (Bluetooth)?

3.5 Do protótipo, o que **vai junto** para a Unity? (marque)
   - [ ] Veículos (jipe etc.)
   - [ ] Metralhadora fixa
   - [ ] Tirolesa
   - [ ] Drone
   - [ ] Loot flutuante
   - [ ] Chuva
   - [ ] Base Militar
   - [ ] Andares e telhados
   - [ ] Itens no chão

3.6 Quantos **jogadores por modo**? BR: ___ / Bomba: ___ x ___ / Bandeira: ___ x ___

3.7 Battle Royale: solo, dupla ou esquadrão? Quantos por equipe?

3.8 Vai ter **modo treino** (contra bots, sem internet)? **(sugestão: sim, ajuda a testar e a segurar jogador novo)**

3.9 Vai ter **partida ranqueada** (patentes, temporadas)?

3.10 Vai ter **chat de voz** ou só chat rápido (frases prontas e emotes)? **(sugestão: só frases prontas no começo; voz pede moderação e mais servidor)**

3.11 Vai ter **amigos, convidar para a equipe e clã**?

---

## 4. Armas e modificações (acessórios)

4.1 Lista de **armas** no lançamento (pistolas, fuzis, submetralhadoras, escopeta, *sniper*, faca, granadas). Quantas de cada?

4.2 **Acessórios** que você citou. Confirme quais entram e como:
   - **Pente:** menor (recarrega rápido) / normal / maior (mais balas, mais lento)
   - **Silenciador:** menor / maior (menos barulho no mapa, some do radar; pode reduzir alcance)
   - **Suporte de braço / coronha:** menos recuo
   - **Empunhadura** (embaixo do cano): mais estabilidade
   - **Mira:** com a câmera de cima, a mira pode servir para **afastar a câmera e ver mais longe** (tipo luneta) ou deixar o tiro mais preciso. Quer assim, ou fica sem mira? **(sugestão: mira = ver mais longe e menos espalhamento do tiro)**

4.3 Os acessórios são **achados na partida** (como no BR) ou **escolhidos antes**, no menu (como nos modos Bomba e Bandeira)? Ou os dois?

4.4 Acessório muda só o jogo ou **aparece no modelo da arma** também? **(sugestão: aparece, mas simples)**

4.5 Acessórios podem ser **comprados**? Cuidado: vender vantagem de jogo afasta jogador ("pague para ganhar"). **(sugestão: acessórios só no jogo; vender só a aparência deles)**

---

## 5. Personagens e skins

5.1 Os personagens **homem e mulher** são fixos ou o jogador escolhe rosto, pele e cabelo?

5.2 Lado **CT e Terrorista**: no BR (todos contra todos) as skins de qualquer lado podem ser usadas? E nos modos de time, a skin precisa ser do lado do jogador?

5.3 Peças de skin: **roupa (corpo inteiro ou parte de cima e de baixo?), capacete, mochila, arma, faca**. Quer também:
   - [ ] Luvas
   - [ ] Máscara/óculos
   - [ ] Paraquedas
   - [ ] Pintura de veículo
   - [ ] Emotes (dancinhas)
   - [ ] Spray
   - [ ] Moldura de perfil
   - [ ] Efeito de abate

5.4 **Raridades:** comum, rara, épica, lendária? Cores de cada uma?

5.5 Skin de arma é **para uma arma específica** (ex.: só o fuzil X) ou serve para todas?

5.6 A **mesma skin** serve para homem e mulher, ou cada um tem a sua?

5.7 Skins só mudam a aparência, **sem vantagem**? **(sugestão: sim; e cuidado com skins que "camuflam" demais o jogador)**

5.8 Quantas skins no lançamento? **(sugestão: poucas e boas, por exemplo 10 roupas, 10 de arma e 3 facas, e ir somando por temporada)**

---

## 6. Loja, dinheiro do jogo e passe

6.1 **Moedas do jogo:** uma só (comprada com dinheiro) ou duas (uma ganha jogando e outra comprada)? **(sugestão: duas)**

6.2 Nome das moedas?

6.3 **Pacotes de skins:** fixos ou trocam toda semana? Vai ter "oferta do dia"?

6.4 **Passe:** quanto tempo dura uma temporada? (ex.: 30 ou 60 dias) Tem parte grátis e parte paga? Quantos níveis?

6.5 Como sobe de nível no passe: XP das partidas, missões diárias e semanais, ou os dois?

6.6 Preço aproximado: passe R$ ___ / pacote R$ ___ / pacotes de moeda R$ ___

6.7 **Caixas e chaves** (abrir e sortear skins): ainda quer? Atenção:
   - Apple e Google **obrigam mostrar a chance** de cada item.
   - No Brasil, o **ECA Digital (Lei 15.211/2025)** proíbe caixas pagas com sorteio em jogos que crianças e adolescentes usam.
   - Alguns países (ex.: Bélgica) proíbem.

   Opções:
   a) Sem caixas, só compra direta **(sugestão)**
   b) Caixas só com moeda ganha jogando (sem dinheiro real)
   c) Caixas pagas, com classificação 18+ e bloqueio por país

6.8 Vai ter **troca ou venda de skins entre jogadores**? **(sugestão: não; dá muito problema, fraude e regras)**

6.9 Ícone da loja: fica no **menu principal**, com aviso de oferta nova? Pode abrir a loja na tela de espera?

---

## 7. Propaganda

7.1 Que tipo de propaganda?
   a) Só **com prêmio** (o jogador escolhe assistir para ganhar algo) **(sugestão: não irrita o jogador)**
   b) Também a que aparece entre partidas
   c) Também *banner* no menu

7.2 O que a propaganda libera? (marque)
   - [ ] Skins mais simples
   - [ ] Níveis do passe
   - [ ] Moeda
   - [ ] Reviver no BR
   - [ ] Dobrar o XP da partida

7.3 Limite de propagandas por dia por jogador? **(sugestão: 5 a 10)**

7.4 Quem paga o passe ou faz qualquer compra **fica sem propaganda forçada**?

7.5 Serviço de propaganda: Google AdMob, Unity Ads, AppLovin? **(sugestão: AdMob ou LevelPlay, que junta várias empresas e paga mais)**

---

## 8. Login e conta

8.1 Formas de login (marque):
   - [ ] Google
   - [ ] Facebook
   - [ ] Apple
   - [ ] E-mail
   - [ ] Convidado (jogar sem conta)

   **Importante:** se o iPhone tiver login com Google ou Facebook, a Apple **exige** também o "Entrar com Apple" (ou parecido).

8.2 Pode jogar como **convidado** e criar conta depois, sem perder o progresso? **(sugestão: sim, muita gente desiste quando o login é obrigatório)**

8.3 A conta é a **mesma no Android e no iPhone** (o jogador troca de celular e não perde as skins)?

8.4 **Apagar a conta** dentro do jogo: as duas lojas **obrigam** ter isso. Ok?

8.5 **Apelido:** único? Pode trocar? Tem filtro de palavrão?

8.6 Precisa pedir **idade** no primeiro acesso? (exigido para proteger menores e para propaganda)

---

## 9. Menu, tela de espera e telas

9.1 **Menu principal:** personagem no centro girando 360° com o dedo. Quer também:
   - [ ] Pinça para dar zoom
   - [ ] Tocar no personagem para fazer uma pose
   - [ ] Fundo que muda por temporada

9.2 Botões do menu: Jogar, Modos, Loja, Passe, Armário (skins), Armas, Perfil, Amigos, Missões, Configurações, Notícias. Falta ou sobra algum?

9.3 **Tela de espera** (procurando partida): mostrar os jogadores que vão entrando, com skins, em fila ou num "palco"? Até quantos aparecem de uma vez (com 30 no BR não cabem todos)? **(sugestão: mostrar a sua equipe grande e os outros em cartões pequenos)**

9.4 **Bots na fila:** depois de quantos **segundos** de espera os bots completam a partida? **(sugestão: 20–40 s)** O jogador fica sabendo quem é bot? Bots usam skins?

9.5 Antes de cair no mapa (BR): tem **avião ou paraquedas**, ou começa no chão como hoje?

9.6 Tela de **fim de partida:** colocação, abates, XP, moeda ganha, progresso do passe, botão "jogar de novo"?

9.7 Quer um **tutorial** na primeira vez que o jogador entra?

---

## 10. Online e servidores

10.1 O jogo é **só online** ou também tem treino sem internet?

10.2 Tecnologia de rede (eu posso recomendar depois com detalhes):
   a) **Servidor dedicado** com o servidor mandando nas regras **(sugestão: é o único jeito sério contra trapaça e funciona melhor com 30 jogadores)**
   b) Um jogador vira o "host" (mais barato, mas fácil de trapacear e cai se o host sair)

10.3 Onde ficam os **servidores**? Só São Paulo ou mais regiões?

10.4 **Serviços de conta, loja e dados** (login, moedas, inventário, passe, salvar progresso):
   a) Unity Gaming Services
   b) PlayFab
   c) Firebase
   d) Sem preferência, você escolhe **(sugestão)**

10.5 **Antitrapaça:** o que é mais importante proteger? (dinheiro do jogo, ranqueada, mira automática ilegal, voar ou atravessar parede)

10.6 Vai ter **denúncia de jogador** e banimento?

10.7 Vai ter **eventos e ofertas que mudam sem atualizar o app** (configuração pelo servidor)? **(sugestão: sim)**

---

## 11. Som

11.1 Vai reaproveitar os **sons do protótipo** (ElevenLabs)? Ou fazer novos?

11.2 Quer **música** no menu? E na partida?

11.3 Vozes de personagem (homem e mulher) e locutor ("vitória", "última zona")?

---

## 12. Lojas, leis e lançamento

12.1 Já tem conta de desenvolvedor? **Google Play** (taxa única de US$ 25) / **Apple** (US$ 99 por ano). Vai publicar como pessoa física ou empresa?

12.2 Tem um **Mac**? Para publicar no iPhone, a Unity precisa de um Mac (ou de um serviço na nuvem) para gerar o app.

12.3 **Política de privacidade e termos de uso**: precisa de um site para isso. Pode ser o GitHub Pages que você já usa?

12.4 **LGPD** (dados de brasileiros) e coleta de dados para propaganda: tudo bem mostrar a tela de permissão?

12.5 Quer **estatísticas** (quantos jogam, onde desistem, o que vendem)? **(sugestão: sim, Firebase Analytics ou Unity Analytics)**

12.6 Quer **relatório de travamentos** automático? **(sugestão: sim)**

12.7 O jogo vai ser atualizado a cada temporada? Com que frequência?

---

## 13. Arquivos e organização (proposta, confirme)

Pasta do projeto Unity (ex.: `JogoUnity/`) no mesmo repositório:

```
Assets/
  _Jogo/
    Scripts/        Jogador, Armas, Bots, Rede, Modos, Loja, Login, UI
    Prefabs/        Personagens, Armas, Acessorios, Objetos, Predios, Veiculos
    Modelos/        Personagens/Homem, Personagens/Mulher, Armas, Facas, Objetos, Predios
    Skins/          Roupas, Capacetes, Mochilas, Armas, Facas  (por lado: CT, TR)
    Materiais/  Texturas/  Animacoes/  Sons/  Musicas/  UI/  Cenas/
    Dados/          tabelas das armas, skins, preços, passe (ScriptableObjects)
```

Arquivos de controle (`.md`, para eu e você sabermos de tudo sem reler o código):
- `CLAUDE.md`: regras para os chats (como hoje)
- `ESTADO_DO_PROJETO.md`: situação atual, curto
- `ESTRUTURA.md`: onde está cada coisa
- `HISTORICO.md`: tudo o que mudou, por data
- `ARMAS.md`: lista de armas, dano, acessórios e números de equilíbrio
- `SKINS.md`: catálogo de skins (nome, peça, lado CT/TR, raridade, preço, como libera)
- `LOJA_E_PASSE.md`: moedas, pacotes, passe de cada temporada e propagandas
- `OBJETOS.md`: modelos 3D prontos, de onde vieram (Meshy, pacote, feito à mão) e licença
- `DESEMPENHO.md`: metas (FPS, memória, tamanho) e resultados dos testes em celular

13.1 Ok com essa organização? Quer mudar algum nome?

13.2 O projeto Unity fica **neste repositório** ou num **novo**? **(sugestão: repositório novo; o protótipo fica como referência)**

13.3 Qual **versão da Unity**? **(sugestão: a versão LTS mais nova, a que tem suporte longo)**

13.4 Quer **testes automáticos** a cada mudança, como hoje com o Playwright? **(sugestão: sim, testes da Unity rodando pela CLI)**

---

## 14. Prioridades

14.1 Coloque em ordem o que fazer primeiro:
   ( ) Jogo rodando no celular, offline, com bots (modo Bomba ou BR)
   ( ) Online
   ( ) Login
   ( ) Loja e skins
   ( ) Passe e propaganda
   ( ) Visual final (modelos 3D)

   **(sugestão: nessa ordem, com objetos simples até o jogo estar bom)**

14.2 Qual modo é o **mais importante** para o lançamento? Pode lançar com só um modo e adicionar os outros depois?

14.3 Tem algo que você **não quer** de jeito nenhum? (hoje: besta, barris explosivos, camuflagem afetando visão dos bots)
