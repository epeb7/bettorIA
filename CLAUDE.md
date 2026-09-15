# bettorIA

## Contexto do produto

**bettor** = contexto de apostador, em português, com ênfase em análise esportiva baseada
na casa de apostas **bet365**. O objetivo é um **agente que sugere apostas** — o melhor
analista de palpites possível, com bet365 como casa de referência para apostar e
Betfair Exchange como referência de linha justa (ver Decisões de arquitetura).

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
3. **Desfalques** (lesões, suspensões) — **NÃO existe na API**, mitigado via `/dropping-odds`
   (ver Lacunas reais da API)
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

### Endpoints, por função

**Descobrir e cotar jogos** (o dia a dia do motor): `/events?sport=football&league=<slug>`
lista todos os jogos da liga (times, ids, data, placar, bookmakerCount, sem odds; cap de
5000/resposta, pagina com limit+skip) — 1 req por liga. `/odds/multi?eventIds=<até
10>&bookmakers=<até 30>` traz odds de até 10 jogos por requisição e é o único que deve ser
usado para isso — nunca `/odds?eventId=` em loop (1 req por jogo, evitar).

**Histórico e backtest**: `/historical/events?sport&league&from&to` traz jogos passados com
placar — base para forma, H2H, médias e tabela; 1 req, cachear pra sempre.
`/historical/closing-lines` traz linhas de fechamento de até 366 dias (temporada inteira)
por sweep, para validar o motor contra o fechamento.

**Sinais e diagnóstico**: `/odds/movements?eventId&bookmaker&market` mostra o movimento da
linha de um mercado. `/dropping-odds?leagues=&minDrop=` lista odds que despencaram — o
**proxy para notícia que não temos** (lesão, escalação), mitigando a lacuna de desfalques
da API (ver abaixo). `/value-bets?bookmaker=Bet365` e `/arbitrage-bets` entregam value bets
e arbitragem prontos, 1 req cada.

**Catálogo, sem apiKey**: `/leagues?sport=football` dá os slugs reais de liga (formato
`spain-la-liga`, `england-premier-league`); `/bookmakers` e `/markets` também não exigem
chave. `/participants/{id}` retorna só `id`, `name`, `sport` — nenhuma estatística.

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

- lesões, suspensões, desfalques — mitigado via `/dropping-odds`, ver acima
- escalações
- estatísticas de desempenho (xG, posse, chutes efetivamente dados) — atenção à pegadinha:
  existem *mercados* sobre chutes/escanteios/faltas, mas isso é odd, não o número real
- tabela pronta (mas dá para montar dos placares)

## Decisões de arquitetura

- **Odds-API.io é o provedor escolhido, com adaptador isolado** — trocar de provedor depois
  é barato. Descartados: **The Odds API** (créditos por mercado × região, sem sharps) e
  **OddsPapi** (só ganharia se a Pinnacle fosse essencial pra medir valor — e não é, ver
  abaixo).
- **Par de casas no free tier: `Bet365` + `Betfair Exchange`.** Bet365 é onde se aposta;
  Betfair Exchange é a referência de linha justa pra medir valor, e serve tão bem quanto a
  Pinnacle (que a Odds-API.io não tem) — o preço vem do dinheiro real dos dois lados (a API
  expõe `depth*` e `lay*` no schema de odds). O modelo de EV roda inteiro aqui, inclusive no
  plano gratuito. *(Corrige a conclusão inicial da conversa, que dependia da Pinnacle e
  ficou desatualizada.)*

## Estado atual

Sem código ainda. Fase de definição de contexto, escolha de provedor e escopo de ligas.

---

## Produto: agente de sugestão de apostas por assinatura

Modelo de negócio: grupo de WhatsApp com clientes já ativos; o agente será vendido como
assinatura para aumentar a arrecadação mensal.

**Fase de validação (atual, = Fase 0 do plano de lançamento): fechada, só 2 usuários.**
Objetivo da fase NÃO é lucro — é acumular **100 alertas com CLV medido** antes de abrir
cobrança.

### Tese central do motor

O edge **não vem de prever futebol melhor**. Vem de **comparar preços**: a bet365 contra o
consenso sem margem das outras 282 casas. Isso funciona na semana 1, sem modelo treinado,
sem histórico. A intuição sobre escanteios/faltas/cartões confirma essa tese: mercado
principal recebe o dinheiro e a atenção, o secundário é precificado mecanicamente —
simulação de 912 preços achou 0,4% de EV>3% no principal contra 13,7% no secundário
(**~31× mais oportunidades**, EV médio maior; simulação do mecanismo, não medição —
confirmar com dados reais). **Consequência prática: varrer os 129 mercados, mas alertar
quase só nos secundários.**

### Matemática do motor (cálculos executados, ver artifact)

```
overround       = Σ (1/odd_i) − 1                    # bet365 típico: 3,91%
p_justa(i)      = (1/odd_i) / Σ(1/odd_j)             # normalização proporcional
EV              = p_justa × (odd_b365 − 1) − (1 − p_justa)
Kelly           f* = EV / (odd − 1)   → usar f*/4     # Kelly ¼ sempre: EV+5% → stake 1,30%
                                                        # da banca, não 10%. Kelly cheio
                                                        # quebra quando a prob. é estimada.
CLV             = (odd_pega / odd_justa_fechamento) − 1
tamanho amostra n = (z·σ / ROI)²
```

- Em **1X2** a normalização proporcional superestima o azarão — usar **Shin** ou
  **power method**. Em mercados de 2 lados a proporcional serve.
- **Gols**: Poisson bivariado + correção **Dixon-Coles** (ρ ≈ −0,10) para placares baixos.
  Um par de lambdas gera todos os mercados de gols coerentes entre si.
- **Escanteios/cartões**: superdispersos (variância ≈ 1,42× a média). **Poisson erra por
  construção** — até 4,09 pp na linha de 8.5. Usar **binomial negativa**.
- **CLV é a métrica que viabiliza o negócio.** Provar ROI de 3% a odd 1.90 exige **3.825
  apostas** (95% conf.) — 3,7 anos a 20 alertas/semana. Provar CLV de 1,5% exige **35
  apostas** — 2 semanas. **~111× mais rápido**, e não depende de nenhuma aposta ter ganhado.
  CLV+ com ROI− em 100 apostas = azar, motor certo; CLV− com ROI+ = sorte, motor errado
  (mesmo com o grupo comemorando). Sem CLV não dá para distinguir, e o produto seria
  calibrado por ruído.

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
individual via WhatsApp Business Platform** (Meta Cloud API, via um BSP — ex.: 360dialog ou
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

---

## Artifacts publicados

- Nota técnica explicando a API para público não-técnico:
  https://claude.ai/code/artifact/07e81101-8453-4ab2-92ea-03eff3e68564
- Nota técnica com a matemática completa do motor:
  https://claude.ai/code/artifact/d9ee0a47-3f70-4fc5-99f1-f65d37728fa2
- Plano de lançamento completo, com todos os fluxos e a opinião de sócio sobre risco de
  reputação em escala:
  https://claude.ai/code/artifact/dbe17fe6-f30f-47bd-883f-92d999a127d9

---

## Arquitetura do produto (web, mobile-first)

### Fonte de dados adicional: estatísticas reais (além de odds)

A Odds-API.io cobre odds + resultados, mas não tem lesões/escalação/tabela pronta
(ver Lacunas reais da API). Preenchendo essa lacuna:

- **API-Football (api-sports.io)** — verificado via busca (fontes de comparação de
  terceiros, não a doc oficial direto — **confirmar com chave de teste antes de travar
  arquitetura nisso**, é grátis). Free tier: **100 req/dia**, cobre temporada atual,
  todos os endpoints liberados sem cartão — **lesões, escalação, classificação,
  estatísticas de jogador/time, predictions**. É exatamente o que falta.
- Como 100 req/dia é justo, usar só para dados que mudam pouco: 1x/dia por liga pra
  tabela + lesões dos times que jogam na semana. Não usar para odds (isso já é a
  Odds-API.io).
- Alternativas verificadas: **football-data.org** (10 req/min, 12 competições, só
  fixtures/resultados/tabela — sem lesões, mais simples e mais liberal em request/min,
  serve como fallback de tabela se API-Football estourar); **TheSportsDB** (grátis mas
  free tier foi ficando mais restrito ao longo dos anos por abuso — não confiar como
  fonte primária).

### Stack (tudo com camada grátis)

| Peça | Escolha | Por quê |
|---|---|---|
| Frontend | Next.js (React), mobile-first PWA | Prioridade explícita é desempenho mobile |
| Hosting frontend | Cloudflare Pages ou Vercel (free) | Grátis, edge, rápido |
| Cron do motor (busca odds a cada 15min) | Cloudflare Workers + Cron Triggers | Grátis, serverless, já mapeado no orçamento de requisições |
| Banco de dados | **Supabase (Postgres)** | Modelo relacional rico necessário pra cruzar apostas entre usuários (ver schema abaixo); free tier + editor de tabela amigável, útil pra conciliação manual do Pix |
| LLM da camada de chat | **Claude Haiku 4.5** | Tarefa é "explicar dado já calculado", não raciocínio complexo — mais barato, ordem de grandeza R$500-1.500/mês em uso moderado (ver Skill claude-api) |
| Auth | Custom: link de ativação único + segredo de dispositivo (ver Plano de lançamento) | Já decidido — sem senha, sem WhatsApp Business API |

### Banco de dados — schema pra cruzar contexto entre usuários

O pedido central é: guardar contexto o bastante pra IA calcular, e cruzar palpites de
diferentes usuários (não só alertas do motor). Tabelas principais:

- `teams` (id, nome, liga, ids externos pra casar Odds-API.io + API-Football)
- `matches` (id, times, liga, data, status, placar, id externo Odds-API.io)
- `odds_snapshots` (match_id, casa, mercado, linha, odd, capturado_em) — série temporal
- `team_stats_external` (team_id, fonte='api-football', lesões[], escalação_última,
  posição_tabela, pontos, forma) — cache diário
- `computed_probabilities` (match_id, mercado, p_justa, EV, kelly_stake, versão_modelo,
  calculado_em) — saída do motor (Camada 1/2)
- `alerts` (id, match_id, mercado, odd_pega, casa, EV, stake_sugerido, enviado_em)
- `closing_lines` (alert_id, odd_justa_fechamento, CLV, capturado_em)
- `users` (id, hash_do_celular, segredo_dispositivo, status_assinatura)
- `user_picks` (id, user_id, alert_id ou mercado_livre, stake_real, colocado_em,
  resultado, pnl) — **isso é o que permite cruzar apostas entre usuários**: cada
  usuário loga o que realmente apostou, não só o que o motor sugeriu
- `user_pick_aggregates` (view materializada: família_mercado, CLV_médio, taxa_acerto,
  n_picks) — agregado entre TODOS os usuários por família de mercado

Consequência direta da matemática já estabelecida: mais usuários registrando picks =
convergência mais rápida pra provar CLV (o `n` da fórmula de tamanho de amostra não se
importa de quem vieram as apostas, só quantas são). Cruzar dados entre usuários
**acelera a validação do motor**, não é só relatório bonito.

### Interface — em desenho

Ver canvas de design publicado (3 direções visuais em avaliação: Terminal escuro estilo
mesa de operação, Fintech claro estilo app de banco, Editorial esportivo escuro e vívido)
— link a confirmar após escolha da direção.

---

## MUDANÇA DE PROVEDOR: Odds-API.io → odds-api.net

**Odds-API.io descartada em 2026-09-14**: cadastro de chave grátis nova pausado
indefinidamente ("New free API keys are paused indefinitely" — confirmado ao vivo no
site). A API em si segue no ar (endpoints sem chave respondem), só não aceita cliente
novo grátis. Planos pagos existem (Solo £49/mês, 2 casas) mas ficou ambíguo se Betfair
Exchange conta como "sharp/exchange book" que exigiria tier mais alto — não confirmado,
não vale mais o esforço dado que achamos alternativa melhor.

### Candidatos avaliados e descartados (nessa ordem, todos verificados ao vivo)

| Provedor | Motivo do descarte |
|---|---|
| The Odds API (the-odds-api.com) | Bet365 só cobre Austrália (AFL/NRL) — zero futebol europeu. Sem Pinnacle, sem Betfair Exchange. |
| SportsGameOdds | Bet365 e Pinnacle só em planos pagos; free tier só tem casas americanas mainstream (FanDuel, DraftKings...). |
| OddsPapi | Bet365+Pinnacle+Betfair Exchange confirmados, mas free tier tem calculadora de preço dinâmica que não expôs limite claro — não descartada por defeito, só não investigada até o fim porque o `odds-api.net` resolveu primeiro. |

### Provedor escolhido: odds-api.net

- **Sem free tier** (confirmado — página de marketing estava certa; um README do GitHub
  deles que dizia "chave grátis disponível" estava desatualizado/errado).
- **Plano Starter: $30/mês, 50.000 requisições/mês.** Nosso uso real é ~5-7 req por
  varredura; mesmo a cada 15min o dia inteiro não passa de ~700/dia (~21k/mês) — sobra
  banda.
- **Bet365 + Pinnacle + Betfair Exchange confirmados juntos** no mesmo request (melhor
  que a Odds-API.io, que não tinha Pinnacle).
- **Cobertura de futebol global confirmada**: Premier League, Serie A, Champions League
  listadas; 45+ ligas, EPL com 36 casas.
- Base URL: `https://api.odds-api.net/v1`, header `X-API-Key`. Todo endpoint exige
  credencial (não tem `/bookmakers` ou `/sports` público sem chave, diferente da
  Odds-API.io).
- Tem SDKs TypeScript/Python, modo mock (`ODDS_API_MOCK=1`) pra desenvolver sem gastar
  requisição, e um MCP server pra agente de código — vale usar durante o desenvolvimento.

### Licenciamento — já resolvido, essa é a diferença importante

Termos de uso **permitem explicitamente** derivative outputs: *"analytics, scores,
rankings, **alerts**, models, reports, charts, **dashboards**, historical studies, and
transformed content."* Só proíbem redistribuir o feed bruto como produto concorrente
("reconstruct, expose, resell, or distribute the raw API data or a competing feed").
Isso é exatamente nosso caso de uso (mostrar alerta calculado, não revender odd crua) —
**resolve a questão que ficou em aberto com a Odds-API.io** sem precisar de e-mail de
autorização.

### Próximo passo

Cadastrar conta paga no `odds-api.net`, gerar chave, confirmar bookmaker names reais
(formato pode diferir de "Bet365"/"Betfair Exchange" como na Odds-API.io) e remapear os
endpoints já documentados (`/events`, `/odds/multi` etc. eram nomes da Odds-API.io —
odds-api.net usa `/v1/sports`, `/v1/bookmakers`, e provavelmente nomes de endpoint
próprios a confirmar na doc real após ter a chave).

---

## Implementado: token de ativação (Pix → login por celular)

Fecha o fluxo entre "Cobrança — Pix manual com centavo único" e
"Autenticação por celular" (ambos já documentados acima), **gratuito** —
nenhuma peça exige serviço pago.

### Fluxo

1. Cliente paga o valor com centavo único combinado (Pix — mesma chave
   estática sempre, o centavo identifica quem pagou).
2. Você confere no app do banco (grátis) que o valor bateu.
3. Roda `npm run engine:generate-link -- --phone "+55..." --name "Fulano" --amount 4937`
   (centavos) — gera um token de ativação de uso único.
4. Cola o link impresso na conversa do WhatsApp com o cliente (grátis, sem
   API de negócio).
5. Cliente clica no link **no celular dele** — primeiro dispositivo a abrir
   consome o token (uso único, ver regra de anti-compartilhamento já
   documentada). Isso é o "login por número de celular": o telefone já é
   conhecido desde a geração do token, não precisa de OTP separado.

### Código

- `engine/src/auth/token.ts` — geração (192 bits, `crypto.randomBytes`) e
  consumo de uso único. 100% função pura, testada.
- `engine/src/auth/store.ts` — interface `TokenStore` trocável (mesmo
  princípio do adaptador da OddsPapi). `FileTokenStore` é só pra rodar hoje,
  local, sem banco — **não é pra produção** (arquivo não aguenta concorrência
  nem sobrevive a ambiente serverless). Trocar por `SupabaseTokenStore`
  quando o banco existir, implementando a mesma interface.
- `engine/src/jobs/generate-link.ts` — o "painel admin" em forma de comando.
- `engine/src/auth/token.test.ts` — 13 testes no total do engine agora,
  incluindo a regra crítica: segundo consumo do mesmo token falha.

### O que falta pra produção (fora do escopo de hoje)

- Rota HTTP `/ativar/<token>` que de fato gera o segredo de dispositivo no
  navegador do cliente (hoje só existe a geração do token, não a ativação
  em si — precisa do Next.js com API route + Supabase).
  PIN a cada 5 dias e limite de 2 dispositivos (já desenhados, não
  implementados).
- `SupabaseTokenStore` no lugar do `FileTokenStore`.

---

## Decisão: guard de ativação adiado (não pra Fase 0)

`/` hoje é acessível sem checar sessão/dispositivo ativado. **Decisão consciente**:
pra Fase 0 (fechada, só usuário + 1 amigo), aviso verbal sobre risco de compartilhamento
substitui o guard técnico — não faz sentido construir proteção contra estranho quando só
tem gente de confiança direta acessando.

**Isso precisa voltar à mesa antes da Fase 2** (30-50 clientes que o usuário não conhece
pessoalmente) — aviso verbal não escala pra gente desconhecida. Não esquecer.
