# bettorIA

## Contexto do produto

**bettor** = contexto de apostador, em português, com ênfase em análise esportiva baseada
na casa de apostas **bet365**. O objetivo é um **agente que sugere apostas**.

- **Escopo atual: futebol apenas.** Especializar primeiro em futebol, depois expandir para
  os demais esportes da plataforma (NBA, MMA, tênis, etc.).
- Idioma do produto e das análises: **português (BR)**.

## Ligas — decisão de escopo

Ordem de entrada definida, e o motivo importa mais que a lista:

1. **La Liga primeiro** (380 jogos/temporada, 10 por rodada). É a base de validação:
   ritmo semanal o ano todo e histórico de confronto direto rico.
2. **Champions League** (144 jogos na fase de liga, 18 por rodada, só 8 rodadas).
   É a competição **mais difícil de modelar**, não a mais fácil: 36 times de países
   diferentes que quase nunca se enfrentaram (H2H praticamente inexistente), rotação de
   elenco e prioridades de temporada distintas. Além disso deixa buracos longos no
   calendário. **Não usar a Champions como métrica de qualidade do modelo nos primeiros meses.**
3. **Premier League como terceira liga — depois da validação na La Liga.** Justificativa:
   (a) compartilha times com a Champions, então cobre o ponto cego de H2H de lá;
   (b) dá volume contínuo o ano todo. O custo de API é irrelevante na decisão
   (varredura completa vai de 5 para 7 requisições).

## Dimensões da análise de um jogo

1. **Forma recente** (últimos 5–6 jogos, casa/fora) — derivável do histórico da API
2. **Retrospecto direto** (H2H) — derivável do histórico da API
3. **Desfalques** (lesões, suspensões) — **NÃO existe na API**, ver lacunas abaixo
4. **Contexto da partida** (tabela, motivação, calendário, mando) — tabela derivável dos placares
5. **Odds da bet365** para o mercado alvo

## Provedor de odds: Odds-API.io

Base URL: `https://api.odds-api.io/v3` — docs em https://docs.odds-api.io/,
spec em https://docs.odds-api.io/api-reference/openapi.json

### Verificado ao vivo em 2026-09-10

- **283 casas** listadas. **Bet365 presente** (`Bet365`). **Pinnacle AUSENTE.**
- **Betfair Exchange presente** — além de SingBet, Orbit Exchange, Polymarket, Kalshi.
- **129 mercados de futebol**, incluindo 18 de escanteios, 11 de cartões, ~20 de jogador,
  além de 1X2, dupla chance, handicap europeu, over/under, BTTS, placar exato, HT/FT,
  e estatísticas (chutes, faltas, impedimentos, desarmes).
- `/markets` e `/bookmakers` não exigem apiKey — dá para inspecionar sem chave.

### Endpoints que importam

| Endpoint | Uso | Custo |
|---|---|---|
| `/events?sport=football&league=<slug>` | **lista todos os jogos da liga** (times, ids, data, placar, bookmakerCount). Sem odds. Cap de 5000/resposta, pagina com limit+skip | 1 req por liga |
| `/odds/multi?eventIds=<até 10>&bookmakers=<até 30>` | **odds de até 10 jogos por requisição** — sempre usar este, nunca `/odds` em loop | 1 req / 10 jogos |
| `/odds?eventId=` | odds de 1 jogo só | evitar |
| `/historical/events?sport&league&from&to` | **jogos passados com placar** → base para forma, H2H, médias, tabela | 1 req, cachear pra sempre |
| `/historical/closing-lines` | linhas de fechamento, até 366 dias (temporada inteira) por sweep | backtest |
| `/odds/movements?eventId&bookmaker&market` | movimento da linha de um mercado | diagnóstico |
| `/dropping-odds?leagues=&minDrop=` | odds que despencaram — **proxy para notícia que não temos** (lesão, escalação) | 1 req |
| `/value-bets?bookmaker=Bet365` | value bets prontos | 1 req |
| `/arbitrage-bets` | arbitragem | 1 req |

Slug de liga: formato `spain-la-liga`, `england-premier-league`. Confirmar os slugs reais
via `/leagues?sport=football` (exige apiKey).

### Limites

- **Free**: 100 req/hora, teto de ~500/dia, **2 casas** à escolha, **só pré-jogo** (sem ao vivo).
- **Pago**: 5.000 req/hora, todas as casas, odds ao vivo, WebSocket.
- Cache recomendado pela doc: odds pré-jogo 30–60s, eventos 5–10min, ligas 1h+.

### Orçamento de requisições

Semana de pico (La Liga 10 jogos + Champions 18 = 28 jogos), varredura completa:
`2 × /events + 3 × /odds/multi` = **5 requisições**.

- Free comporta 20 varreduras/hora; o teto de 500/dia é o que aperta primeiro (100/dia).
- 28 jogos atualizados a cada 15 min o dia inteiro ≈ 300 req/dia → **cabe no free**.
- Com a Premier (38 jogos): 7 req por varredura, ~400/dia → ainda cabe.
- **O free só fica curto quando quisermos odds ao vivo (jogo rolando).**

### Lacunas reais da API

É uma API de **cotações + resultados**, não de estatísticas de futebol. NÃO tem:

- lesões, suspensões, desfalques
- escalações
- estatísticas de desempenho (xG, posse, chutes efetivamente dados) — atenção à pegadinha:
  existem *mercados* sobre chutes/escanteios/faltas, mas isso é odd, não o número real
- tabela pronta (mas dá para montar dos placares)
- `/participants/{id}` retorna só `id`, `name`, `sport` — nenhuma estatística

**Mitigação para desfalques**: usar `/dropping-odds`. Queda brusca na linha ≈ o mercado
reagiu a uma notícia que não enxergamos.

## Decisões de arquitetura

- **Adaptador isolado para a fonte de odds.** Trocar de provedor depois é barato.
- **Par de casas no free tier: `Bet365` + `Betfair Exchange`.** Bet365 é onde se aposta,
  Betfair Exchange é a referência de linha justa para medir valor.

## Correção de conclusão anterior

A conversa inicial concluiu que só a **OddsPapi** serviria para modelo de valor esperado,
por ser a única com Pinnacle. **Isso está desatualizado.** A Pinnacle realmente não está na
Odds-API.io, mas a **Betfair Exchange está** — e exchange é referência de linha justa
equivalente ou melhor, porque o preço vem do dinheiro real parado dos dois lados (a API
inclusive expõe `depth*` e `lay*` no schema de odds). O modelo de EV roda inteiro na
Odds-API.io, inclusive no plano gratuito.

Mantida a decisão: **Odds-API.io**. The Odds API segue descartada (créditos por
mercado × região, sem sharps).

## Estado atual

Sem código ainda. Fase de definição de contexto, escolha de provedor e escopo de ligas.

Nota técnica explicando a API para público não-técnico:
https://claude.ai/code/artifact/07e81101-8453-4ab2-92ea-03eff3e68564

---

## Produto: agente de sugestão de apostas por assinatura

Modelo de negócio: grupo de WhatsApp com clientes já ativos; o agente será vendido como
assinatura para aumentar a arrecadação mensal.

**Fase 1 (atual): fechada, só 2 usuários.** Objetivo da fase NÃO é lucro — é acumular
**100 alertas com CLV medido** antes de abrir cobrança.

### Tese central do motor

O edge **não vem de prever futebol melhor**. Vem de **comparar preços**: a bet365 contra o
consenso sem margem das outras 282 casas. Isso funciona na semana 1, sem modelo treinado,
sem histórico.

### Matemática do motor (cálculos executados, ver artifact)

```
overround       = Σ (1/odd_i) − 1                    # bet365 típico: 3,91%
p_justa(i)      = (1/odd_i) / Σ(1/odd_j)             # normalização proporcional
EV              = p_justa × (odd_b365 − 1) − (1 − p_justa)
Kelly           f* = EV / (odd − 1)   → usar f*/4
CLV             = (odd_pega / odd_justa_fechamento) − 1
tamanho amostra n = (z·σ / ROI)²
```

- Em **1X2** a normalização proporcional superestima o azarão — usar **Shin** ou
  **power method**. Em mercados de 2 lados a proporcional serve.
- **Gols**: Poisson bivariado + correção **Dixon-Coles** (ρ ≈ −0,10) para placares baixos.
  Um par de lambdas gera todos os mercados de gols coerentes entre si.
- **Escanteios/cartões**: superdispersos (variância ≈ 1,42× a média). **Poisson erra por
  construção** — até 4,09 pp na linha de 8.5. Usar **binomial negativa**.

### Descobertas que orientam o produto

1. **A intuição sobre escanteios/faltas/cartões está matematicamente certa.** Mercado
   principal recebe o dinheiro e a atenção; secundário é precificado mecanicamente. Simulação
   de 912 preços: 0,4% dos preços principais passam de EV>3%, contra 13,7% nos secundários —
   **~31× mais oportunidades, com EV médio maior**. (Simulação do mecanismo, não medição;
   confirmar com dados reais.)
   → **Varrer os 129 mercados, mas alertar quase só nos secundários.**

2. **CLV é a métrica que viabiliza o negócio.** Provar ROI de 3% a odd 1.90 exige **3.825
   apostas** (95% conf.) — 3,7 anos a 20 alertas/semana. Provar CLV de 1,5% exige **35
   apostas** — 2 semanas. **~111× mais rápido**, e não depende de nenhuma aposta ter ganhado.
   - CLV+ com ROI− em 100 apostas = azar, motor certo.
   - CLV− com ROI+ = sorte, motor errado (mesmo com o grupo comemorando).
   - Sem CLV não dá para distinguir, e o produto seria calibrado por ruído.

3. **Kelly ¼ sempre.** EV de +5% → stake de **1,30% da banca**, não 10%. Kelly cheio quebra
   quando a probabilidade é estimada.

### Regra invariável de operação

**Nenhum alerta sai sem estar registrado antes** (jogo, mercado, odd pega, odd justa, EV,
stake, horário). A odd de fechamento é coletada depois, automaticamente, e vira CLV.
Track record montado depois, escolhendo o que contar, não vale nada — nem para calibrar
o motor, nem para quem paga assinatura.

### Camadas do motor

| Camada | Quando | O quê |
|---|---|---|
| 1 — Consenso sem vig | Semana 1 | bet365 vs consenso normalizado. Aritmética pura, opera sozinha. |
| 2 — Modelo próprio | Mês 2 | Dixon-Coles (gols) + binomial negativa (escanteios/cartões). Exige fonte de escanteios/cartões **efetivamente ocorridos** — a API não tem. |
| 3 — Sinal de movimento | Contínua | `/dropping-odds` como alerta e como freio (EV+ pode ser informação velha). |

Nota técnica com a matemática completa:
https://claude.ai/code/artifact/d9ee0a47-3f70-4fc5-99f1-f65d37728fa2

---

## Plano de lançamento — escala para ~500 clientes (VIP)

Contexto: grupo de WhatsApp já tem ~500 clientes pagantes (fora do agente). Objetivo:
lançar o agente como produto pago pra essa base pra aumentar arrecadação mensal.

### Decisões travadas (respondidas pelo usuário)

- **Cobrança: Pix manual + confirmação**, não gateway automatizado no lançamento.
- **Maior preocupação de anti-abuso: compartilhar 1 login entre vários** (não foi
  priorizado: revenda de conteúdo, multi-conta grátis, chargeback — podem voltar depois).
- **Autenticação: só número de celular, sem email/senha.**

### Autenticação por celular

Fluxo: número → código de 6 dígitos **via WhatsApp** (não SMS — reaproveita o canal que
os clientes já confiam e que o produto já vai usar pra entregar alerta) → sessão sem senha.

**Requisito estrutural não-opcional**: migrar do grupo de WhatsApp comum para **envio
individual via WhatsApp Business Platform** (Meta Cloud API, via BSP como 360dialog ou
Blip). Um grupo tradicional não segura produto pago — não dá pra cobrar de uns e cortar
acesso de outros dentro do mesmo grupo em escala.

### Anti-compartilhamento (3 camadas, sem ferramenta de antifraude)

1. **Sessão única por número** — login em device novo derruba o anterior na hora.
2. **Sessão nunca "lembrada"** — todo device novo pede o código de novo.
3. **Sinal de "viagem impossível"** — login em regiões distantes em minutos → fila de
   revisão manual (viável à mão em 500 clientes).

Princípio: não impede 100%, encarece o compartilhamento até não valer a pena — mesmo
modelo do streaming.

### Cobrança — Pix manual com centavo único

Cada cliente recebe um valor com **centavo único** (ex: cliente #237 paga R$49,37 em vez
de R$49,00) — o extrato bancário já identifica quem pagou, sem comparar comprovante
manualmente. Fluxo: gera valor → manda chave Pix + QR pelo WhatsApp → cliente paga →
alguém confere extrato 2-3x/dia → libera acesso.

Caminho de evolução: Pix dinâmico via gateway (OpenPix, Asaas, Pagar.me) com webhook,
quando o manual começar a doer. Exige CNPJ/MEI — reforça a necessidade de formalizar,
mais urgente nesse volume (não bloqueante pro lançamento).

### Entrega em dois canais

- **WhatsApp individual**: alerta curto e rápido (jogo, mercado, odd, EV, stake).
- **Dashboard web mobile-first**: histórico completo, CLV por mercado, track record
  público **mostrando os erros também**, link pra documentação do motor.

Mesmo login (celular + código) nos dois lugares.

### Faseamento (a ordem que evita o erro mais caro)

| Fase | O quê | Depende de | Critério de saída |
|---|---|---|---|
| 0 — Validar motor | Já em andamento | Nada | 35-100 alertas, CLV medido e positivo |
| 1 — Construir infra | Login celular, Pix manual, dashboard, migrar grupo→individual | Nada — **roda em paralelo à Fase 0** | Fluxo ponta a ponta com contas de teste |
| 2 — Beta pago fechado | 30-50 clientes de maior confiança, preço fundador | Fase 0 **e** Fase 1 | 2-3 semanas sem incidente, CLV segue positivo |
| 3 — Rollout pros 500 | Base inteira | Fase 2 limpa | — |

Prazo honesto ponta a ponta até a Fase 3: **2-3 meses**, se nada travar.

**Fase 0 continua bloqueante mesmo com a Fase 1 pronta** — o risco de abrir pra 500
clientes que já pagam por outra coisa com motor não validado é reputacional, não técnico,
e é mais caro que qualquer bug de login.

### Régua financeira (estimativa, não plano de preço fechado)

500 clientes × R$30-50/mês = R$15.000-25.000/mês. Custo de infra estimado (WhatsApp
Business Platform + hospedagem) ~R$500-1.500/mês — ordem de grandeza, confirmar com
provedor escolhido.

Plano completo com todos os fluxos e a opinião de sócio sobre risco de reputação em escala:
https://claude.ai/code/artifact/dbe17fe6-f30f-47bd-883f-92d999a127d9
