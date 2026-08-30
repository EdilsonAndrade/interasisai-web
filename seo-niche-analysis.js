#!/usr/bin/env node

/**
 * Niche SEO Analysis - Analisa concorrentes por nicho
 * Uso: node seo-niche-analysis.js [niche]
 * 
 * Nichos disponíveis:
 *   - escolas
 *   - buffets
 *   - agencias-software
 *   - clinicas
 *   - ecommerce
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const Table = require('cli-table3');

const NICHES = {
  'escolas': {
    name: 'Escolas (Validação de Nicho)',
    description: 'Analisar como escolas usam web para atrair pais',
    competitors: [
      { name: 'Escola Exemplo 1', url: 'https://escolaexemplo1.com.br' },
      { name: 'Escola Exemplo 2', url: 'https://escolaexemplo2.com.br' },
      { name: 'Escola Exemplo 3', url: 'https://escolaexemplo3.com.br' }
    ],
    keyMetrics: ['title', 'h1Count', 'wordCount', 'linkCount', 'loadTime', 'schema']
  },

  'buffets': {
    name: 'Buffets & Eventos (Validação de Nicho)',
    description: 'Analisar presença web de buffets de festa e restaurantes',
    competitors: [
      { name: 'Buffet Exemplo 1', url: 'https://buffetexemplo1.com.br' },
      { name: 'Buffet Exemplo 2', url: 'https://buffetexemplo2.com.br' },
      { name: 'Buffet Exemplo 3', url: 'https://buffetexemplo3.com.br' }
    ],
    keyMetrics: ['title', 'imageCount', 'wordCount', 'loadTime', 'schema', 'ogImage']
  },

  'agencias-software': {
    name: 'Agências de Software (Concorrentes Diretos)',
    description: 'Analisar como outras agências de software se posicionam',
    competitors: [
      { name: 'Agência Concorrente 1', url: 'https://agencia1.com.br' },
      { name: 'Agência Concorrente 2', url: 'https://agencia2.com.br' },
      { name: 'Agência Concorrente 3', url: 'https://agencia3.com.br' }
    ],
    keyMetrics: ['title', 'titleLength', 'descriptionLength', 'h1Count', 'wordCount', 'schema']
  },

  'clinicas': {
    name: 'Clínicas & Consultórios (Nicho Potencial)',
    description: 'Analisar presença web de clínicas e seus padrões SEO',
    competitors: [
      { name: 'Clínica Exemplo 1', url: 'https://clinicaexemplo1.com.br' },
      { name: 'Clínica Exemplo 2', url: 'https://clinicaexemplo2.com.br' },
      { name: 'Clínica Exemplo 3', url: 'https://clinicaexemplo3.com.br' }
    ],
    keyMetrics: ['title', 'keywords', 'schema', 'wordCount', 'canonical', 'viewport']
  },

  'ecommerce': {
    name: 'E-commerce (Referência de Performance)',
    description: 'Analisar padrões de e-commerce bem estruturados',
    competitors: [
      { name: 'E-commerce Exemplo 1', url: 'https://ecommerce1.com.br' },
      { name: 'E-commerce Exemplo 2', url: 'https://ecommerce2.com.br' },
      { name: 'E-commerce Exemplo 3', url: 'https://ecommerce3.com.br' }
    ],
    keyMetrics: ['title', 'titleLength', 'imageCount', 'linkCount', 'wordCount', 'loadTime']
  }
};

class NicheAnalyzer {
  constructor(niche) {
    this.niche = NICHES[niche] || NICHES['agencias-software'];
    this.results = [];
  }

  async analyzeSite(site) {
    let browser;
    try {
      browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });

      const startTime = Date.now();
      await page.goto(site.url, { waitUntil: 'networkidle2', timeout: 30000 });
      const loadTime = Date.now() - startTime;

      const data = await page.evaluate(() => ({
        title: document.title,
        titleLength: document.title.length,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
        descriptionLength: document.querySelector('meta[name="description"]')?.getAttribute('content')?.length || 0,
        keywords: !!document.querySelector('meta[name="keywords"]'),
        viewport: !!document.querySelector('meta[name="viewport"]'),
        canonical: !!document.querySelector('link[rel="canonical"]'),
        h1Count: document.querySelectorAll('h1').length,
        h2Count: document.querySelectorAll('h2').length,
        h3Count: document.querySelectorAll('h3').length,
        imageCount: document.querySelectorAll('img').length,
        linkCount: document.querySelectorAll('a').length,
        wordCount: document.body.innerText.split(/\s+/).filter(w => w.length > 0).length,
        ogImage: !!document.querySelector('meta[property="og:image"]'),
        schema: !!document.querySelector('script[type="application/ld+json"]'),
        hasMain: !!document.querySelector('main'),
        hasNav: !!document.querySelector('nav'),
        hasFooter: !!document.querySelector('footer')
      }));

      return {
        name: site.name,
        url: site.url,
        loadTime,
        ...data,
        score: this.calculateScore(data)
      };
    } catch (error) {
      return {
        name: site.name,
        url: site.url,
        error: error.message,
        score: 0
      };
    } finally {
      if (browser) await browser.close();
    }
  }

  calculateScore(data) {
    let score = 50;
    if (data.title) score += 5;
    if (data.titleLength >= 30 && data.titleLength <= 60) score += 5;
    if (data.descriptionLength >= 120 && data.descriptionLength <= 160) score += 10;
    if (data.keywords) score += 2;
    if (data.viewport) score += 3;
    if (data.canonical) score += 5;
    if (data.h1Count === 1) score += 8;
    if (data.h2Count >= 2) score += 5;
    if (data.wordCount > 300) score += 8;
    if (data.schema) score += 10;
    if (data.hasMain && data.hasNav) score += 7;
    return Math.min(100, score);
  }

  async analyzeAll() {
    console.log(`\n🔍 Analisando nicho: ${this.niche.name}\n`);
    
    for (const site of this.niche.competitors) {
      console.log(`  📊 ${site.name}...`);
      const result = await this.analyzeSite(site);
      this.results.push(result);
    }
  }

  printReport() {
    console.log('\n' + '═'.repeat(120));
    console.log(`📈 ${this.niche.name.toUpperCase()}`);
    console.log('═'.repeat(120));
    console.log(`\n${this.niche.description}\n`);

    // Tabela principal
    const mainTable = new Table({
      head: ['Site', 'Score', 'Title', 'Description', 'Conteúdo', 'Performance', 'Schema', 'Status'],
      colWidths: [30, 12, 12, 15, 12, 15, 10, 10]
    });

    this.results.forEach(r => {
      if (r.error) {
        mainTable.push([r.name, '❌', '-', '-', '-', '-', '-', '🚫 Erro']);
      } else {
        const badge = r.score >= 80 ? '🟢' : r.score >= 70 ? '🟡' : '🔴';
        const perfBadge = r.loadTime < 2000 ? '✅' : r.loadTime < 3000 ? '⚠️' : '🔴';
        const contentBadge = r.wordCount > 300 ? '✅' : '⚠️';
        mainTable.push([
          r.name,
          `${r.score}/100 ${badge}`,
          `${r.titleLength}c ${r.titleLength >= 30 && r.titleLength <= 60 ? '✅' : '⚠️'}`,
          `${r.descriptionLength}c ${r.descriptionLength >= 120 && r.descriptionLength <= 160 ? '✅' : '⚠️'}`,
          `${r.wordCount}w ${contentBadge}`,
          `${perfBadge} ${r.loadTime}ms`,
          r.schema ? '✅' : '❌',
          r.score >= 70 ? '✅ Bom' : '⚠️ Baixo'
        ]);
      }
    });

    console.log(mainTable.toString());

    // Insights por nicho
    this.printNicheInsights();

    // Benchmark (média do nicho)
    this.printBenchmark();

    console.log('\n' + '═'.repeat(120) + '\n');
  }

  printNicheInsights() {
    const validResults = this.results.filter(r => !r.error);
    if (validResults.length === 0) return;

    console.log('\n💡 INSIGHTS DO NICHO:');
    console.log('─'.repeat(120));

    // Médias do nicho
    const avgScore = Math.round(validResults.reduce((sum, r) => sum + r.score, 0) / validResults.length);
    const avgWordCount = Math.round(validResults.reduce((sum, r) => sum + r.wordCount, 0) / validResults.length);
    const avgLoadTime = Math.round(validResults.reduce((sum, r) => sum + r.loadTime, 0) / validResults.length);
    const schemaAdoption = Math.round((validResults.filter(r => r.schema).length / validResults.length) * 100);

    console.log(`\n📊 Médias do Nicho:`);
    console.log(`   • Score médio: ${avgScore}/100`);
    console.log(`   • Conteúdo médio: ${avgWordCount} palavras`);
    console.log(`   • Performance média: ${avgLoadTime}ms`);
    console.log(`   • Adoção de Schema Markup: ${schemaAdoption}%`);

    // Padrões observados
    console.log(`\n🔍 Padrões Observados:`);
    
    const titlesOK = validResults.filter(r => r.titleLength >= 30 && r.titleLength <= 60).length;
    console.log(`   • ${titlesOK}/${validResults.length} sites têm title otimizado`);

    const descriptionsOK = validResults.filter(r => r.descriptionLength >= 120 && r.descriptionLength <= 160).length;
    console.log(`   • ${descriptionsOK}/${validResults.length} sites têm description otimizada`);

    const h1OK = validResults.filter(r => r.h1Count === 1).length;
    console.log(`   • ${h1OK}/${validResults.length} sites usam 1 H1 (correto)`);

    // Oportunidades
    console.log(`\n🎯 Oportunidades de Diferenciação:`);
    
    if (schemaAdoption < 50) {
      console.log(`   ✓ Implementar Schema Markup (apenas ${schemaAdoption}% dos concorrentes usam)`);
    }
    
    if (avgWordCount < 500) {
      console.log(`   ✓ Aumentar conteúdo (média do nicho: ${avgWordCount} palavras)`);
    }
    
    if (avgLoadTime > 2500) {
      console.log(`   ✓ Otimizar performance (média do nicho: ${avgLoadTime}ms)`);
    }

    const metaTagsGaps = validResults.filter(r => r.titleLength < 30 || r.titleLength > 60 || r.descriptionLength < 120).length;
    if (metaTagsGaps > validResults.length / 2) {
      console.log(`   ✓ Otimizar meta tags (muitos concorrentes deixam fazer)`);
    }
  }

  printBenchmark() {
    const validResults = this.results.filter(r => !r.error);
    if (validResults.length === 0) return;

    const topScore = validResults.reduce((a, b) => a.score > b.score ? a : b);
    const fastestLoad = validResults.reduce((a, b) => a.loadTime < b.loadTime ? a : b);
    const mostContent = validResults.reduce((a, b) => a.wordCount > b.wordCount ? a : b);

    console.log('\n🏆 BENCHMARKS DO NICHO:');
    console.log('─'.repeat(120));
    console.log(`\n   🥇 Melhor Score: ${topScore.name} (${topScore.score}/100)`);
    console.log(`   ⚡ Mais Rápido: ${fastestLoad.name} (${fastestLoad.loadTime}ms)`);
    console.log(`   📝 Mais Conteúdo: ${mostContent.name} (${mostContent.wordCount} palavras)`);
  }

  exportData(format = 'json') {
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `niche-analysis-${this.niche.name.split(' ')[0].toLowerCase()}-${timestamp}.${format}`;

    if (format === 'json') {
      fs.writeFileSync(fileName, JSON.stringify({
        niche: this.niche.name,
        timestamp: new Date().toISOString(),
        results: this.results
      }, null, 2));
    } else if (format === 'csv') {
      const headers = ['Site', 'Score', 'TitleLen', 'DescLen', 'WordCount', 'LoadTime', 'Schema', 'H1', 'H2'];
      const rows = this.results
        .filter(r => !r.error)
        .map(r => [
          r.name,
          r.score,
          r.titleLength,
          r.descriptionLength,
          r.wordCount,
          r.loadTime,
          r.schema ? 'Y' : 'N',
          r.h1Count,
          r.h2Count
        ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      fs.writeFileSync(fileName, csv);
    }

    console.log(`\n✅ Dados exportados: ${fileName}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const nicheArg = args[0] || 'agencias-software';

  if (nicheArg === '--list') {
    console.log('\n📋 Nichos Disponíveis:\n');
    Object.entries(NICHES).forEach(([key, niche]) => {
      console.log(`  ${key}`);
      console.log(`    → ${niche.description}\n`);
    });
    process.exit(0);
  }

  const analyzer = new NicheAnalyzer(nicheArg);
  await analyzer.analyzeAll();
  analyzer.printReport();

  // Exportar dados
  analyzer.exportData('json');
  analyzer.exportData('csv');
}

main().catch(console.error);
