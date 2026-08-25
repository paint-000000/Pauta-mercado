# Pauta Mercado

Jornal financeiro com uma camada de inteligência. Transforma notícias, dados de
mercado e acontecimentos econômicos em algo que responde a uma pergunta:
**o que aconteceu hoje e onde vale prestar atenção?**

Sem cadastro, sem login, sem dado pessoal. O site funciona ao entrar.

> ⚠️ **Protótipo.** Todas as cotações, notícias e análises são fictícias, e as
> empresas individuais são inventadas de propósito — ver
> [Dados](#dados-e-por-que-são-fictícios). Não use nada daqui para decidir
> investimento.

---

## A decisão que organiza o produto

Existem **duas camadas visuais e elas nunca se confundem**:

| Camada | Tratamento | O que é |
|---|---|---|
| **Jornalismo** | Serifada, sobre papel, régua fina, fonte declarada | O que foi apurado |
| **Inteligência** | Superfície escura, sans/mono, acento verde-água | O que foi interpretado |

Dá para saber de relance, sem ler, o que é dado e o que é leitura do dado. É a
identidade visual e o cumprimento da promessa de transparência ao mesmo tempo.

Uma segunda distinção, também semântica: **conteúdo editorial** (matéria,
manchete, tabela) usa canto reto e régua; **ferramenta** (radar, simulador,
controles) usa raio e elevação. O leitor sabe pela forma onde ele lê e onde ele
age.

## O que a IA faz — e o que ela não faz

Faz: resume em linguagem simples, explica quem pode ser afetado, descreve
cenários (inclusive os ruins), aponta o que acompanhar e classifica numa escala
de seis estados.

**Não faz:** não manda comprar nem vender, não inventa número, não promete
resultado, não trata rumor de oferta como fato. A projeção do simulador não é
exceção: ela sai de um motor determinístico, não de um modelo de linguagem.

Toda entrada do radar carrega o campo `invalidaria` — o que faria a leitura
deixar de valer. É obrigatório no tipo, e é o que separa análise de palpite com
formatação bonita.

### Os seis estados

`oportunidade` · `favoravel` · `observar` · `neutro` · `cautela` · `risco`

Cada um difere em **cor e em forma** do marcador (quadrado cheio, quadrado
vazado, círculo, barra, triângulo, losango). Um print em preto e branco ainda
separa os seis.

## Simulador

Cinco perguntas — valor, aporte mensal, prazo, tolerância a oscilação,
reserva — e uma distribuição sugerida com a razão de cada fatia.

**O motor é determinístico** ([`src/lib/simulador.ts`](src/lib/simulador.ts)).
Nenhum modelo de linguagem escolhe alocação: a mesma entrada produz sempre a
mesma saída, o que torna o resultado testável e auditável. Toda saída carrega
qual regra dominou a decisão.

Ordem de precedência, e as de cima vencem sempre:

1. **R1** — sem reserva de emergência, tudo vai para liquidez diária.
2. **R2** — prazo curto sobrepõe apetite por risco. Dinheiro para menos de um
   ano não vai para renda variável, mesmo com "aceito bastante oscilação"
   marcado. A tela explica isso em vez de ignorar a resposta.
3. **R3** — abaixo de um piso, fracionar em várias fatias ensina menos que uma.
4. **R4** — matriz por tolerância e prazo.

## Projeção

O simulador responde também "quanto isso me devolve ao longo do tempo".
Responder isso é o risco central do produto, porque a forma natural da
resposta — um número — é uma promessa. A saída aqui não é um número: é uma
**faixa** com três cenários e a probabilidade declarada de cada um.

O motor é determinístico e separado do da alocação
([`src/lib/projecao.ts`](src/lib/projecao.ts)). O modelo é lognormal, o mesmo
que qualquer material sério usa para desenhar faixa, e ele codifica duas coisas
que a tela precisa dizer:

1. A faixa **abre com o tempo em reais** — incerteza acumula.
2. A faixa **fecha com o tempo em taxa anual** — é isto que "prazo longo
   perdoa oscilação" quer dizer, e é a única razão defensável para aceitar
   renda variável.

Quatro decisões contra a leitura otimista, todas travadas em teste:

- **O eixo começa em zero.** Cortar a base infla visualmente o ganho, e é o
  truque de gráfico mais comum de material de investimento.
- **A linha do dinheiro depositado atravessa o gráfico.** A distância dela até
  a faixa é o rendimento; sem ela, "R$ 44 mil" parece rendimento e é sobretudo
  depósito. Cada aporte é descontado da própria data, não do fim do horizonte —
  deflacionar tudo pelo fator final encolheria o depósito e inflaria o
  rendimento aparente.
- **Poder de compra vem ligado por padrão.** O número nominal é maior e informa
  menos.
- **O cenário otimista não tem traço próprio.** Ele e o pessimista são a borda
  da mesma área, com a mesma espessura. Destacar o de cima seria fazer
  propaganda com CSS.

O bloco inteiro fica sobre a superfície escura de IA, porque nenhum destes
números foi observado — todos foram calculados a partir de premissa declarada.

### Premissas

Os retornos não são digitados um a um. Saem do cenário macro **apurado** mais
um prêmio de risco por classe.
Um número mágico não se revisa, se troca; um número derivado se contesta em
pedaços: discorda-se do juro real, ou de um prêmio, ou do beta, e o resto se
recalcula coerente.

A tela abre essa tabela para o leitor. O produto exige `fonte` em todo número
apurado, e nenhum número da projeção foi apurado — o equivalente honesto da
procedência, para número calculado, é mostrar a conta.

#### O juro converge, não é constante

A primeira versão fixava o juro real em 4,0%. Isso quebrou no dia em que o site
passou a puxar dado real: a página mostrava **Selic de 14%** e a projeção, no
mesmo scroll, dizia que a reserva rendia **8,68%** ao ano. Cinco pontos de
diferença. Ninguém precisa saber o que é juro neutro para ver que uma das duas
está errada.

Trocar 4,0% por 14% resolveria essa contradição e criaria uma pior: projetar dez
anos com a taxa do mês supõe que a política monetária de hoje dura uma década.
Selic a 14% é remédio, não temperatura normal do corpo.

As duas coisas são verdade em prazos diferentes, então o modelo usa as duas. A
taxa parte do juro real corrente — apurado do Banco Central — e converge
linearmente para o neutro em três anos. Em um ano a reserva rende 13,1%, perto
da Selic que está na tela; em dez, 9,4%. A tabela de premissas na tela acompanha
o horizonte escolhido, porque uma tabela fixa ao lado de um número que varia com
o prazo seria as duas coisas se contradizendo.

Consequência para os testes: eles passam um cenário macro explícito. Um teste
cujo resultado muda quando o Copom se reúne não testa nada.

#### Três defeitos que a calibragem corrigiu

| Defeito | O que o modelo dizia | Correção |
|---|---|---|
| Inversão risco-retorno | Título de inflação rendia menos que a reserva com 7× a oscilação | Escada monótona, travada em teste |
| Risco específico remunerado | Ações rendiam mais que o ETF só por oscilarem mais | Beta de 1,15: retorno sobe pouco, oscilação sobe muito |
| Correlação única (0,45) | A fatia de exterior não descolava de nada | Matriz por blocos — e o exterior é o que menos acompanha a bolsa local |

Todos empurravam na mesma direção.

Um quarto defeito só apareceu **depois** de a escada por classe ficar correta:
as três carteiras do simulador terminavam dez anos empatadas em ~11%, porque o
arrasto da volatilidade (`−σ²/2`) comia todo o prêmio. O motor contradizia a
regra R4 da tela ao lado sem que nada acusasse. O arrasto é real e continua no
modelo; o prêmio de bolsa é que estava baixo demais para o risco que remunera.
Hoje a escada chega até a carteira — 9,6% · 10,1% · 10,9% de mediana, com pior
ano de −0,3% · −5,6% · −14,0% — e as duas pontas estão travadas em teste.

A matriz de correlação passa por decomposição de Cholesky no teste: nem todo
conjunto de correlações plausíveis uma a uma descreve um mundo que existe, e se
o pivô der negativo alguma carteira teria variância negativa.

## Estrutura

```
src/
├── app/          rotas (App Router)
├── components/
│   ├── chrome/   masthead, faixa de cotações, busca, rodapé
│   ├── glossario/ termo explicável em qualquer texto
│   └── ui/       dados, sparkline, gráfico de projeção, estados, procedência
├── data/         conteúdo do protótipo
│   └── gerado/   dado real do robô diário, e onde ele encosta
├── lib/          motor do simulador, validação, série, preferências
├── styles/       tokens (primitivo → semântico → componente)
└── types/        modelo de domínio

scripts/         validação de conteúdo e o gancho de alias do Node
```

### Valor vivo na prosa

O jornal escreveu *"o Copom manteve a Selic em 10,50%"*. A frase era verdadeira
quando foi redigida e virou mentira sozinha no dia em que a ingestão entrou: a
faixa do topo passou a mostrar 14,00% do Banco Central, e o texto três
centímetros abaixo continuou em 10,50%.

Revisar o texto não resolve de forma durável — o próximo número cravado
envelhece igual, em silêncio. A marcação `{{selic}}` tira o número da string e
o busca no render, seguindo a mesma escolha do glossário: marcação explícita, e
marcação órfã derruba o build.

```
{{selic}}         valor atual formatado    14,00%
{{ibovespa.var}}  variação, com sinal      +0,80%
```

Duas coisas que a marcação **não** faz. Não conserta afirmação: interpolar a
Selic numa frase que diz "o Copom cortou" não torna o corte verdadeiro. E não
rejuvenesce a edição — a data continua sendo a da redação, e a página declara a
idade dela junto com a ressalva de que os números são de hoje.

A regra `número apurado não fica cravado na prosa` impede a recaída. A primeira
versão dela era ampla demais e acusou *"Travar IPCA mais 6%"*, onde o 6% é juro
real somado e não o valor do índice — regra que grita à toa é desligada, e regra
desligada não pega o caso de verdade. O que separa os dois é a preposição: só
"em", "a", "aos" e "para" afirmam que o indicador vale aquilo.

### Glossário transversal

Qualquer termo técnico em qualquer texto vira um chip explicável, marcado como
`[[selic]]` no conteúdo. A explicação abre sobre a página — quem parou no meio
de uma frase volta para ela.

Termos técnicos que não estão dentro de uma frase (rótulo de tabela, cabeçalho
de indicador) usam `<TermoChip>`. "EV/EBITDA" numa coluna precisa ser
explicável exatamente como "duration" num parágrafo.

### Painéis: busca e glossário

Os dois painéis abrem por cima do que estava sendo lido, e o comportamento de
diálogo é o mesmo nos dois ([`src/lib/dialogo.ts`](src/lib/dialogo.ts)): `Esc`
fecha, o foco entra no painel, não escapa por `Tab` enquanto ele está aberto, e
volta exatamente para onde estava ao fechar — quem abriu o glossário no meio de
um parágrafo volta para aquele parágrafo. É a promessa que o painel faz ao não
ser uma rota. A rolagem do fundo trava junto.

O glossário troca de termo sem fechar ao seguir um "ver também", e nessa troca
o foco não é roubado.

## Dados

O site se atualiza sozinho, uma vez por dia, e continua sendo export estático:
**nenhum leitor faz chamada de rede**. Quem fala com a internet é o GitHub
Actions, às 18:30 de Brasília, de segunda a sexta — depois do fechamento da B3
e da publicação das séries do Banco Central. A cadeia é
`cron → busca → commit → build → Pages`.

O dado é versionado de propósito: o histórico do git vira o histórico do que o
site mostrou, e dá para responder "o que estava na tela no dia X" sem manter
banco nenhum.

| Fonte | O que traz | Chave |
|---|---|---|
| Banco Central (SGS) | Selic, IPCA 12m, dólar | não precisa |
| brapi.dev | Ibovespa e cotações da B3 | `BRAPI_TOKEN` nos secrets |

**Falha não apaga e não mente.** Se uma fonte cai, o último valor bom continua
na tela — com a data dele — e a tarja do topo avisa que aquele número está
velho. As três saídas são explícitas no manifesto: `novo`, `mantido`, `velho`.
Não existe uma quarta.

### Ticker real nunca recebe tese

É a regra que a entrada de dados reais tornou necessária, e é a mais importante
do projeto.

Escrever "cautela por alavancagem" sobre uma companhia real, com número que
ninguém apurou, produz exatamente o artefato que o produto existe para não
produzir. Cotação real não resolve isso — agrava: com PETR4 na tela, qualquer
texto ao lado vira análise sobre a Petrobras.

O acordo: o robô traz **preço, fonte e horário** para papel real. A camada de
interpretação continua restrita a classe de ativo e macroeconomia, onde afirmar
algo não é falar de uma empresa específica. O compilador não pega isso — os
dois campos são strings válidas. A regra `empresa real não carrega tese de
protótipo` pega, e derruba o build antes do commit.

### O que é real e o que continua fictício

O que é **apurado**: Selic, IPCA e câmbio, direto do Banco Central, com data de
apuração e fonte. Perdem o selo "Protótipo" sozinhos, porque a natureza vira
`apurado` na origem.

A faixa de cotações do topo mistura os dois desde então, e a tarja sozinha
deixou de dar conta — quem olha o IBOV não relê a tarja. O que é inventado ganha
marca própria ali: régua tracejada sob a sigla e um til. Diferem em **forma**,
não só em cor, pela mesma razão dos seis estados do radar. A lista do que é real
na tarja é derivada do dado, não digitada: escrita à mão, ela envelheceria na
primeira fonte nova que alguém ligasse.

O que continua **inventado**: todas as empresas individuais e todas as
análises. A tarja do topo diz isso separadamente — uma tarja de honestidade que
afirma algo falso é pior que nenhuma, porque ensina o leitor a ignorar tarja.

O que é **real** e sempre foi: nomes de índices, moedas e classes de ativo
(Ibovespa, Selic, Tesouro IPCA+, ETF de índice). São categorias públicas.

As empresas inventadas — Aurora Saneamento, Norte Logística, Volcame Energia,
Merídia Renda Urbana — continuam inventadas.

Isso não é preguiça. Escrever uma tese de "cautela por alavancagem" sobre uma
companhia real, com números inventados, produziria exatamente o artefato que o
produto existe para não produzir — e um print dessa página não teria como se
defender. Empresas inventadas não têm esse risco.

Trocar por dados reais é mudança em `src/data/`, não em código.

### Fontes que a versão real usaria

Banco Central (Selic, câmbio, Focus) · IBGE (IPCA, PIB) · B3 (índices,
cotações, ofertas) · CVM (registro de ofertas) · Tesouro Direto.

Toda informação carrega `fonte` como campo obrigatório no tipo — o compilador
impede que um número sem procedência chegue à página.

## O que é verificado antes de publicar

O compilador garante que os campos existem. Não garante que o conteúdo deles
faz sentido, e é aí que mora o risco deste produto: uma falha de conteúdo aqui
não aparece na tela como erro — ela publica um número sem defesa.

`npm run verificar` roda os quatro passos, e o CI roda os mesmos a cada push.
`npm run build` não sai sem a validação de conteúdo passar (`prebuild`).

**Validação de conteúdo** ([`src/lib/validacao.ts`](src/lib/validacao.ts)) — sete
regras sobre os dados:

1. Todo `[[termo]]`, em qualquer texto, abre alguma explicação. Um chip órfão
   degrada para texto simples em produção, então o leitor não vê erro nenhum:
   ele só não recebe a explicação que o texto prometeu. Falha silenciosa é
   exatamente o tipo que precisa quebrar o build.
2. O glossário fecha em si mesmo — sem slug duplicado e sem "ver também"
   apontando para o vazio.
3. Todo dado carrega ao menos uma fonte, com nome e data que são data.
4. Toda tese diz o que a invalidaria.
5. Status que afirma que uma oferta existe exige fonte primária.
6. E, se não tiver, a oferta não pode aparecer como confirmada na tela —
   independentemente do que o campo `status` diga. O status escrito nunca é a
   autoridade.
7. Toda referência interna resolve: ticker com página, indicador que existe,
   rótulo de tabela apontando para termo real.

**Testes** — o motor do simulador, o gerador de série e o saneamento das
preferências locais. Rodam no runner do próprio Node, sem dependência de teste
instalada: o Node 22.6+ executa TypeScript direto.

Os testes do simulador não travam os percentuais da matriz, que são
placeholders e vão mudar. Travam o que não pode mudar quando eles mudarem: a
precedência das quatro regras, as fatias somando 100% e somando o total
informado, e mais tolerância a risco nunca resultando em menos renda variável.

## Pendências conhecidas

- **Percentuais da matriz do simulador** são placeholders estruturais. Estão
  isolados numa única constante e precisam de revisão por profissional
  habilitado antes de qualquer uso real.
- **Premissas de retorno e volatilidade da projeção** continuam sem revisão por
  profissional habilitado. Passaram por uma calibragem interna que as tirou de
  números digitados e as pôs derivadas de um cenário macro declarado (ver
  [Premissas](#premissas)), com as propriedades travadas em teste — o que torna
  a tabela revisável, não revisada. Não vieram de série histórica real.
- **A projeção ignora imposto e taxa**, e a tela diz isso. Come-cotas, IR
  regressivo e taxa de administração mudam o resultado o bastante para não
  entrarem como detalhe.
- **Enquadramento regulatório** — recomendar alocação a pessoa identificada se
  aproxima de consultoria de valores mobiliários, atividade regulada pela CVM.
  O produto hoje usa só classes genéricas e linguagem não prescritiva, mas a
  decisão de enquadramento precisa ser tomada antes de dados reais entrarem.
- **Ações e Ibovespa dependem de `BRAPI_TOKEN`.** Sem o segredo configurado, o
  passo não falha: o Banco Central atualiza normalmente e as cotações ficam com
  o último valor bom, marcadas como velhas na tela. Meio site atualizado é
  melhor que build vermelho.
- **Cotação em tempo real não entra.** O dado da B3 é de fechamento, uma vez
  por dia. Tempo real na B3 é serviço pago e com restrição de redistribuição —
  não é limitação técnica, é licença.
- Sem backend, e de propósito: o leitor nunca faz chamada de rede.
- Sem teste de interface. O que está coberto é a lógica pura — motor,
  validação, saneamento. Componente não tem teste automatizado.

## Rodando

```bash
npm install
npm run dev
```

Abre em `http://localhost:3000`.

Publicado em **https://paint-000000.github.io/Pauta-mercado/** a cada push na
`main`, via GitHub Pages.

```bash
npm run verificar   # tipos + lint + testes + validação de conteúdo
npm test            # só os testes
npm run validar     # só a validação de conteúdo
npm run build       # build de produção (roda a validação antes)
```

Requer Node 22.6 ou mais novo: os testes e a validação rodam TypeScript direto,
sem passo de compilação e sem dependência extra.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · CSS com tokens.

Sem biblioteca de gráfico: os sparklines e o gráfico de projeção são SVG
escrito à mão. O briefing pedia gráficos minimalistas e alertava contra excesso
de gráfico — um caminho SVG dá controle exato sobre o traço e não carrega
runtime.

A regra original dizia que biblioteca entraria se aparecesse interação de
verdade. Ela apareceu — a projeção tem guia que segue o dedo e lê qualquer ano
— e mesmo assim não entrou: o desenho é uma área, duas linhas e uma guia
vertical, e um runtime de gráfico custaria mais em peso do que devolveria em
código. O gráfico traz tabela equivalente, porque um gráfico sem tabela é um
dado que existe só para quem enxerga.

Sem Tailwind: os tokens são a fonte de verdade única do design system, em três
níveis (primitivo → semântico → componente). A UI nunca consome primitivo
direto.

**Tinta escura só sobre superfície escura.** `--ia-tinta`, `--ia-tinta-2` e
`--ia-acento` são desenhados para a camada de IA. Sobre papel, `--ia-tinta` dá
**1,13:1** — branco no branco. Não é hipótese: os links "Simulador" e "Radar
IA" do menu ficaram invisíveis assim, contra 11,2:1 dos vizinhos, e o defeito
só apareceu porque alguém achou que estavam "meio apagados". CSS não passa pelo
compilador, então `npm run tokens` faz essa checagem e roda no CI.

A checagem ignora uso como **fundo**: `.btn[data-v="claro"]` pinta o acento
atrás de tinta escura e mede 9,01:1, que é legítimo. Marcar isso repetiria o
erro da regra de conteúdo que acusava "IPCA mais 6%" — alarme falso vira alarme
ignorado.

No menu, a distinção das páginas de IA passou a ser feita por **forma**: o
ponto ao lado do rótulo, em 10:1. É a mesma decisão dos seis estados do radar.

Sem framework de teste: `node --test` já vem no Node e executa TypeScript sem
compilar. Uma dependência de teste aqui não resolveria nada que ele não
resolva.

---

Conteúdo informativo e educacional. Não é recomendação de investimento.
