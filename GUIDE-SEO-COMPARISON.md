# 🔄 Guia Completo - Scripts de Comparação SEO

Use estes scripts para entender como você se compara com concorrentes e validar nichos.

---

## 📦 Scripts Disponíveis

### 1. **seo-compare.js** - Comparar sites específicos
Compare seu site com qualquer concorrente em detalhes.

### 2. **seo-niche-analysis.js** - Análise por nicho
Analise padrões de SEO em um nicho inteiro (escolas, buffets, agências, etc).

### 3. **Dashboard de Comparação** (aqui no chat)
Interface visual para ver vencedores e oportunidades lado a lado.

---

## 🚀 Quick Start

### Instalação (uma vez)

```bash
cd /seu-projeto
npm install puppeteer cli-table3
```

### Usar seo-compare.js

#### Opção 1: Comparar sites específicos (CLI)

```bash
# Comparar dois sites
node seo-compare.js https://www.interasisai.com.br https://concorrente.com.br

# Gera automaticamente:
# - seo-comparison-2026-08-30.json
# - seo-comparison-2026-08-30.csv
```

#### Opção 2: Editar lista de concorrentes (dentro do arquivo)

Abra `seo-compare.js` e edite a seção `COMPETITORS`:

```javascript
const COMPETITORS = [
  { name: 'Interasis AI', url: 'https://www.interasisai.com.br' },
  { name: 'Agência Concorrente 1', url: 'https://agencia1.com.br' },
  { name: 'Agência Concorrente 2', url: 'https://agencia2.com.br' },
  { name: 'Agência Concorrente 3', url: 'https://agencia3.com.br' }
];
```

Depois rode:

```bash
node seo-compare.js
```

### Usar seo-niche-analysis.js

#### Ver nichos disponíveis

```bash
node seo-niche-analysis.js --list
```

Output:
```
📋 Nichos Disponíveis:

  escolas
    → Escolas (Validação de Nicho)

  buffets
    → Buffets & Eventos (Validação de Nicho)

  agencias-software
    → Agências de Software (Concorrentes Diretos)

  clinicas
    → Clínicas & Consultórios (Nicho Potencial)

  ecommerce
    → E-commerce (Referência de Performance)
```

#### Analisar um nicho

```bash
# Analisar escolas
node seo-niche-analysis.js escolas

# Analisar buffets
node seo-niche-analysis.js buffets

# Analisar agências de software
node seo-niche-analysis.js agencias-software
```

---

## 📊 Entender os Resultados

### Saída do seo-compare.js

```
══════════════════════════════════════════════════════════════════════════════════════════════════════════════
📊 COMPETITIVE SEO ANALYSIS
══════════════════════════════════════════════════════════════════════════════════════════════════════════════

┌────────────────────────┬────────────┬────────────┬─────────────────┬──────────┬──────────────┬────────────┐
│ Site                   │ Score      │ Status     │ Performance     │ Title    │ Description  │ Keywords   │
├────────────────────────┼────────────┼────────────┼─────────────────┼──────────┼──────────────┼────────────┤
│ Interasis AI           │ 77/100 🟡  │ 🟡         │ ⚠️ 2887ms       │ ✅ (74)  │ ✅ (116)     │ ✅         │
├────────────────────────┼────────────┼────────────┼─────────────────┼──────────┼──────────────┼────────────┤
│ Concorrente 1          │ 72/100 🟡  │ 🟡         │ 🔴 3456ms       │ ⚠️ (82)  │ ⚠️ (95)      │ ❌         │
├────────────────────────┼────────────┼────────────┼─────────────────┼──────────┼──────────────┼────────────┤
│ Concorrente 2          │ 68/100 🔴  │ 🔴         │ ✅ 1800ms       │ ✅ (55)  │ ✅ (145)     │ ✅         │
└────────────────────────┴────────────┴────────────┴─────────────────┴──────────┴──────────────┴────────────┘

📰 ESTRUTURA & CONTEÚDO:
┌────────────────────────┬──────┬──────┬────────────┬──────────────┬────────────┬────────┐
│ Site                   │ H1   │ H2   │ Palavras   │ Imagens      │ Alt Text   │ Links  │
├────────────────────────┼──────┼──────┼────────────┼──────────────┼────────────┼────────┤
│ Interasis AI           │ 1 ✅ │ 3 ✅ │ 5930 ✅    │ 0            │ ✅ All     │ 15     │
├────────────────────────┼──────┼──────┼────────────┼──────────────┼────────────┼────────┤
│ Concorrente 1          │ 2 ❌ │ 2 ⚠️ │ 3200 ⚠️    │ 12           │ ❌ 4       │ 22     │
├────────────────────────┼──────┼──────┼────────────┼──────────────┼────────────┼────────┤
│ Concorrente 2          │ 1 ✅ │ 4 ✅ │ 6500 ✅    │ 8            │ ✅ All     │ 18     │
└────────────────────────┴──────┴──────┴────────────┴──────────────┴────────────┴────────┘

🎯 ANÁLISE COMPETITIVA:

  🥇 Melhor Score: Interasis AI (77/100)
  ⚡ Mais Rápido: Concorrente 2 (1800ms)
  📝 Mais Conteúdo: Concorrente 2 (6500 palavras)

  vs Concorrente 1:
    ✓ Você tem melhor score (+5 pontos)
    ✓ Você é mais rápido (-569ms)
    ⚠️ Concorrente 1 tem mais conteúdo (+1730 palavras)

  vs Concorrente 2:
    ⚠️ Concorrente 2 tem score melhor (+5 pontos)
    ⚠️ Concorrente 2 é mais rápido (-1087ms)
    ⚠️ Concorrente 2 tem mais conteúdo (+570 palavras)
```

### Saída do seo-niche-analysis.js

```
══════════════════════════════════════════════════════════════════════════════════════════════════════════════
📈 AGÊNCIAS DE SOFTWARE (CONCORRENTES DIRETOS)
══════════════════════════════════════════════════════════════════════════════════════════════════════════════

Analisar como outras agências de software se posicionam

📊 Médias do Nicho:
   • Score médio: 74/100
   • Conteúdo médio: 4200 palavras
   • Performance média: 2650ms
   • Adoção de Schema Markup: 60%

🔍 Padrões Observados:
   • 2/3 sites têm title otimizado
   • 1/3 sites têm description otimizada
   • 2/3 sites usam 1 H1 (correto)

🎯 Oportunidades de Diferenciação:
   ✓ Implementar Schema Markup (apenas 60% dos concorrentes usam)
   ✓ Aumentar conteúdo (média do nicho: 4200 palavras)
   ✓ Otimizar meta tags (muitos concorrentes deixam fazer)

🏆 BENCHMARKS DO NICHO:
   🥇 Melhor Score: Agência X (82/100)
   ⚡ Mais Rápido: Agência Y (1400ms)
   📝 Mais Conteúdo: Agência Z (7800 palavras)
```

---

## 💡 Casos de Uso

### Caso 1: Validar Nicho de Escolas

Antes de vender para escolas, quer saber: eles investem em SEO?

```bash
node seo-niche-analysis.js escolas
```

**Procure por:**
- ✅ Média de score > 70 = Escola se preocupa com presença web
- ✅ Muitos usam Schema Markup = Sofisticação
- ✅ Conteúdo > 1000 palavras = Investem em marketing

**Se encontrar:**
- ❌ Scores baixos (< 60) = Oportunidade! Eles precisam melhorar
- ❌ Ninguém usa Schema = Você pode diferenciar

### Caso 2: Benchmarking Contra Concorrentes

Quer entender se você é competitivo:

```bash
# Edite COMPETITORS em seo-compare.js com seus concorrentes reais
node seo-compare.js
```

**Procure por:**
- Você está acima da média? (+5 pontos vs concorrentes)
- Seu tempo de carregamento é bom? (< 2000ms)
- Você tem mais conteúdo? (ajuda ranking)

### Caso 3: Rastrear Progresso

```bash
# Semana 1 - Baseline
node seo-compare.js > week1-report.txt

# Implementar melhorias
# ...

# Semana 3 - Validar
node seo-compare.js > week3-report.txt

# Comparar reports manualmente
diff week1-report.txt week3-report.txt
```

### Caso 4: Descobrir Oportunidades

Analise os **scores baixos** dos concorrentes:

```bash
# Se Concorrente A tem score 60:
# - Procure por "não usa Schema" ou "title muito longo"
# - Essas são gaps que você pode explorar
```

---

## 🔧 Personalizar Scripts

### Adicionar mais nichos (seo-niche-analysis.js)

Abra o arquivo e adicione:

```javascript
const NICHES = {
  'seu-nicho': {
    name: 'Seu Nicho (Descrição)',
    description: 'Descrição detalhada',
    competitors: [
      { name: 'Site 1', url: 'https://site1.com' },
      { name: 'Site 2', url: 'https://site2.com' },
      { name: 'Site 3', url: 'https://site3.com' }
    ],
    keyMetrics: ['title', 'h1Count', 'wordCount', 'loadTime', 'schema']
  },
  // ... outros nichos
};
```

### Adicionar métricas customizadas

Edite a seção `calculateScore()` para dar mais peso a métricas importantes para seu nicho.

Por exemplo, para e-commerce, imagens são críticas:

```javascript
if (data.imageCount > 10 && data.imagesWithoutAlt === 0) score += 15; // +15 pontos
```

---

## 📈 Workflow Recomendado

### Semana 1: Descoberta

```bash
# Analise seu nicho alvo
node seo-niche-analysis.js escolas

# Veja benchmarks
node seo-niche-analysis.js escolas --list
```

**Decisão:** Vale a pena focar neste nicho?

### Semana 2: Competitive Intelligence

```bash
# Identifique concorrentes diretos
# Edite COMPETITORS em seo-compare.js
node seo-compare.js
```

**Decisão:** Você é competitivo? Tem gaps?

### Semana 3: Otimização

Implemente melhorias baseadas nos gaps encontrados:

```bash
# Se concorrente usa Schema, você não:
# → Implementar Schema Markup

# Se concorrente tem 2x seu conteúdo:
# → Aumentar conteúdo de 2000w para 4000w

# Se concorrente é 2x mais rápido:
# → Otimizar performance (lazy load, cache, etc)
```

### Semana 4: Validação

```bash
node seo-compare.js

# Checklist:
# - [ ] Score melhorou?
# - [ ] Tempo de carregamento diminuiu?
# - [ ] Conteúdo aumentou?
# - [ ] Implementou gaps?
```

---

## 📊 Interpretar Relatórios

### CSV (para Excel/Google Sheets)

```bash
node seo-compare.js
# Gera: seo-comparison-2026-08-30.csv

# Abra no Excel e crie gráficos:
# - Gráfico de barras: Scores
# - Gráfico de área: Performance ao longo do tempo
```

### JSON (para análise programática)

```bash
node seo-compare.js --json
# Gera: seo-comparison-2026-08-30.json

# Use em Python, Node, etc para análise customizada
```

---

## ⚠️ Troubleshooting

### Erro: "Cannot find module 'cli-table3'"

```bash
npm install cli-table3
```

### Erro: "Timeout"

Site levou muito tempo para carregar. Edite o timeout:

```javascript
// Em seo-compare.js ou seo-niche-analysis.js, linha ~30:
await page.goto(site.url, { 
  waitUntil: 'networkidle2', 
  timeout: 60000  // Aumentar para 60 segundos
});
```

### Site bloqueou seu script?

Alguns sites detectam Puppeteer. Tente:

```javascript
const browser = await puppeteer.launch({ 
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage'
  ]
});
```

---

## 🎯 Próximos Passos

1. **Hoje:**
   ```bash
   node seo-niche-analysis.js escolas
   ```
   Entender o nicho de escolas

2. **Amanhã:**
   ```bash
   # Editar COMPETITORS com 3 escolas reais
   node seo-niche-analysis.js escolas
   ```
   Validar escolas específicas

3. **Esta semana:**
   ```bash
   node seo-compare.js https://www.interasisai.com.br [escolas-competidoras]
   ```
   Comparar você vs escolas

4. **Semana que vem:**
   Implementar gaps encontrados e re-auditar

---

## 💬 Perguntas Comuns

**P: Qual site devo escolher para vender?**
R: Escolha o nicho onde você está 10+ pontos acima da média de score.

**P: Quanto tempo leva analisar um nicho?**
R: ~2-3 minutos por site, então ~5-10 min para 3 sites.

**P: Os scores são oficiais?**
R: Não. São cálculos nossos baseados em boas práticas. Use como guia, não verdade absoluta.

**P: Posso comparar meu site em dois momentos (antes/depois)?**
R: Sim! Salve em JSON, depois compare os arquivos JSON.

---

**Última atualização:** Agosto 30, 2026  
**Para:** Edilson (InterasisAI)
