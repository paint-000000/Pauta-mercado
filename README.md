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
resultado, não trata rumor de oferta como fato.

Toda entrada do radar carrega o campo `invalidaria` — o que faria a leitura
deixar de valer. É obrigatório no tipo, e é o que separa análise de palpite com
formatação bonita.

### Os seis estados

`oportunidade` · `favoravel` · `observar` · `neutro` · `cautela` · `risco`

Cada um difere em **cor e em forma** do marcador (quadrado cheio, quadrado
vazado, círculo, barra, triângulo, losango). Um print em preto e branco ainda
separa os seis.

## Simulador

Três perguntas — valor, prazo, tolerância a oscilação, reserva — e uma
distribuição sugerida com a razão de cada fatia.

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

## Estrutura

```
src/
├── app/          rotas (App Router)
├── components/
│   ├── chrome/   masthead, faixa de cotações, busca, rodapé
│   ├── glossario/ termo explicável em qualquer texto
│   └── ui/       dados, sparkline, estados, procedência
├── data/         conteúdo do protótipo
├── lib/          motor do simulador, série do sparkline
├── styles/       tokens (primitivo → semântico → componente)
└── types/        modelo de domínio
```

### Glossário transversal

Qualquer termo técnico em qualquer texto vira um chip explicável, marcado como
`[[selic]]` no conteúdo. A explicação abre sobre a página — quem parou no meio
de uma frase volta para ela.

Termos técnicos que não estão dentro de uma frase (rótulo de tabela, cabeçalho
de indicador) usam `<TermoChip>`. "EV/EBITDA" numa coluna precisa ser
explicável exatamente como "duration" num parágrafo.

## Dados, e por que são fictícios

O que é **real**: nomes de índices, moedas e classes de ativo (Ibovespa, Selic,
Tesouro IPCA+, ETF de índice). São categorias públicas.

O que é **inventado**: todos os números, e todas as empresas individuais —
Aurora Saneamento, Norte Logística, Volcame Energia, Merídia Renda Urbana.

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

## Pendências conhecidas

- **Percentuais da matriz do simulador** são placeholders estruturais. Estão
  isolados numa única constante e precisam de revisão por profissional
  habilitado antes de qualquer uso real.
- **Enquadramento regulatório** — recomendar alocação a pessoa identificada se
  aproxima de consultoria de valores mobiliários, atividade regulada pela CVM.
  O produto hoje usa só classes genéricas e linguagem não prescritiva, mas a
  decisão de enquadramento precisa ser tomada antes de dados reais entrarem.
- Sem backend: os dados são estáticos e não há integração com API.

## Rodando

```bash
npm install
npm run dev
```

Abre em `http://localhost:3000`.

```bash
npm run build   # build de produção
npx tsc --noEmit  # checagem de tipos
```

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · CSS com tokens.

Sem biblioteca de gráfico: os sparklines são SVG escrito à mão. O briefing pedia
gráficos minimalistas e alertava contra excesso de gráfico — um caminho SVG dá
controle exato sobre o traço e não carrega runtime. Biblioteca entraria só se
aparecer interação de verdade, como tooltip ou zoom.

Sem Tailwind: os tokens são a fonte de verdade única do design system, em três
níveis (primitivo → semântico → componente). A UI nunca consome primitivo
direto.

---

Conteúdo informativo e educacional. Não é recomendação de investimento.
