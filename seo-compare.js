#!/usr/bin/env node

/**
 * SEO Comparison Tool - Compara seu site com concorrentes
 * Uso: node seo-compare.js
 * 
 * Edite as URLs em COMPETITORS abaixo para seus concorrentes reais
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const Table = require('cli-table3');

const COMPETITORS = [
  { name: 'Interasis AI', url: 'https://www.interasisai.com.br' },
  { name: 'Concorrente 1', url: 'https://exemplo1.com.br' },
  { name: 'Concorrente 2', url: 'https://exemplo2.com.br' },
  // Adicione mais aqui
];

class CompetitiveAnalysis {
  constructor(sites) {
    this.sites = sites;
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
        lang: document.documentElement.getAttribute('lang'),
        h1Count: document.querySelectorAll('h1').length,
        h2Count: document.querySelectorAll('h2').length,
        h3Count: document.querySelectorAll('h3').length,
        imageCount: document.querySelectorAll('img').length,
        imagesWithoutAlt: Array.from(document.querySelectorAll('img')).filter(img => !img.alt).length,
        linkCount: document.querySelectorAll('a').length,
        wordCount: document.body.innerText.split(/\s+/).filter(w => w.length > 0).length,
        ogTitle: !!document.querySelector('meta[property="og:title"]'),
        ogImage: !!document.querySelector('meta[property="og:image"]'),
        ogUrl: !!document.querySelector('meta[property="og:url"]'),
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
    if (data.imageCount > 0 && data.imagesWithoutAlt === 0) score += 7;
    if (data.ogTitle && data.ogImage) score += 10;
    if (data.schema) score += 10;
    if (data.hasMain && data.hasNav) score += 7;
    return Math.min(100, score);
  }

  async analyzeAll() {
    console.log('🔍 Analisando sites...\n');
    
    for (const site of this.sites) {
      console.log(`  Analisando: ${site.name}...`);
      const result = await this.analyzeSite(site);
      this.results.push(result);
    }
  }

  printComparison() {
    console.log('\n' + '═'.repeat(100));
    console.log('📊 COMPETITIVE SEO ANALYSIS');
    console.log('═'.repeat(100) + '\n');

    // Tabela de scores
    const scoresTable = new Table({
      head: ['Site', 'Score', 'Status', 'Performance', 'Title', 'Description', 'Keywords'],
      colWidths: [25, 12, 12, 15, 12, 15, 12]
    });

    this.results.forEach(r => {
      if (r.error) {
        scoresTable.push([r.name, '❌', 'Erro', '-', '-', '-', '-']);
      } else {
        const badge = r.score >= 80 ? '🟢' : r.score >= 70 ? '🟡' : '🔴';
        const perfBadge = r.loadTime < 2000 ? '✅' : r.loadTime < 3000 ? '⚠️' : '❌';
        scoresTable.push([
          r.name,
          `${r.score}/100 ${badge}`,
          badge,
          `${perfBadge} ${r.loadTime}ms`,
          r.titleLength ? `✅ (${r.titleLength})` : '❌',
          r.descriptionLength ? `✅ (${r.descriptionLength})` : '❌',
          r.keywords ? '✅' : '❌'
        ]);
      }
    });

    console.log(scoresTable.toString());

    // Tabela de estrutura
    console.log('\n📰 ESTRUTURA & CONTEÚDO:');
    const structTable = new Table({
      head: ['Site', 'H1', 'H2', 'Palavras', 'Imagens', 'Alt Text', 'Links'],
      colWidths: [25, 8, 8, 12, 12, 12, 10]
    });

    this.results.forEach(r => {
      if (!r.error) {
        structTable.push([
          r.name,
          `${r.h1Count} ${r.h1Count === 1 ? '✅' : '❌'}`,
          `${r.h2Count} ${r.h2Count >= 2 ? '✅' : '⚠️'}`,
          `${r.wordCount} ${r.wordCount > 300 ? '✅' : '⚠️'}`,
          `${r.imageCount}`,
          `${r.imagesWithoutAlt === 0 ? '✅ All' : '❌ ' + r.imagesWithoutAlt}`,
          `${r.linkCount}`
        ]);
      }
    });

    console.log(structTable.toString());

    // Tabela de features
    console.log('\n🚀 FEATURES IMPLEMENTADAS:');
    const featuresTable = new Table({
      head: ['Site', 'Viewport', 'Canonical', 'Open Graph', 'Schema', 'Main/Nav/Footer'],
      colWidths: [25, 12, 12, 15, 10, 20]
    });

    this.results.forEach(r => {
      if (!r.error) {
        featuresTable.push([
          r.name,
          r.viewport ? '✅' : '❌',
          r.canonical ? '✅' : '❌',
          `${r.ogTitle && r.ogImage ? '✅' : '⚠️'}`,
          r.schema ? '✅' : '❌',
          `${r.hasMain && r.hasNav && r.hasFooter ? '✅' : '⚠️'}`
        ]);
      }
    });

    console.log(featuresTable.toString());

    // Análise comparativa
    this.printComparativeAnalysis();

    console.log('\n' + '═'.repeat(100) + '\n');
  }

  printComparativeAnalysis() {
    console.log('\n🎯 ANÁLISE COMPETITIVA:');
    console.log('═'.repeat(100));

    const validResults = this.results.filter(r => !r.error);
    if (validResults.length === 0) return;

    // Melhor score
    const topScore = validResults.reduce((a, b) => a.score > b.score ? a : b);
    console.log(`\n🥇 Melhor Score: ${topScore.name} (${topScore.score}/100)`);

    // Melhor performance
    const fastestLoad = validResults.reduce((a, b) => a.loadTime < b.loadTime ? a : b);
    console.log(`⚡ Mais Rápido: ${fastestLoad.name} (${fastestLoad.loadTime}ms)`);

    // Mais conteúdo
    const mostContent = validResults.reduce((a, b) => a.wordCount > b.wordCount ? a : b);
    console.log(`📝 Mais Conteúdo: ${mostContent.name} (${mostContent.wordCount} palavras)`);

    // Melhor estrutura
    const bestStructure = validResults.filter(r => r.h1Count === 1 && r.h2Count >= 2);
    if (bestStructure.length > 0) {
      console.log(`📰 Melhor Estrutura: ${bestStructure.map(r => r.name).join(', ')}`);
    }

    // Gaps identificados
    console.log('\n📌 OPORTUNIDADES DE DIFERENCIAÇÃO:');
    const yours = validResults[0]; // Assume que o primeiro é o seu site
    
    validResults.slice(1).forEach(competitor => {
      console.log(`\n  vs ${competitor.name}:`);
      
      if (yours.wordCount > competitor.wordCount) {
        console.log(`    ✓ Você tem mais conteúdo (+${yours.wordCount - competitor.wordCount} palavras)`);
      } else if (competitor.wordCount > yours.wordCount) {
        console.log(`    ⚠️ ${competitor.name} tem mais conteúdo (+${competitor.wordCount - yours.wordCount} palavras)`);
      }

      if (yours.score > competitor.score) {
        console.log(`    ✓ Seu score é melhor (+${yours.score - competitor.score} pontos)`);
      } else if (competitor.score > yours.score) {
        console.log(`    ⚠️ ${competitor.name} tem score melhor (+${competitor.score - yours.score} pontos)`);
      }

      if (yours.loadTime < competitor.loadTime) {
        console.log(`    ✓ Você é mais rápido (-${competitor.loadTime - yours.loadTime}ms)`);
      } else if (competitor.loadTime < yours.loadTime) {
        console.log(`    ⚠️ ${competitor.name} é mais rápido (-${yours.loadTime - competitor.loadTime}ms)`);
      }
    });
  }

  exportJSON(filename) {
    fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
    console.log(`✅ Dados exportados: ${filename}`);
  }

  exportCSV(filename) {
    const headers = ['Site', 'Score', 'LoadTime', 'H1', 'H2', 'WordCount', 'Images', 'Title', 'Description', 'Viewport', 'Canonical', 'OG', 'Schema'];
    const rows = this.results
      .filter(r => !r.error)
      .map(r => [
        r.name,
        r.score,
        r.loadTime,
        r.h1Count,
        r.h2Count,
        r.wordCount,
        r.imageCount,
        r.titleLength,
        r.descriptionLength,
        r.viewport ? 'Y' : 'N',
        r.canonical ? 'Y' : 'N',
        (r.ogTitle && r.ogImage ? 'Y' : 'N'),
        r.schema ? 'Y' : 'N'
      ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    fs.writeFileSync(filename, csv);
    console.log(`✅ CSV exportado: ${filename}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  // Verificar se há URLs customizadas
  const customUrls = args.filter(arg => arg.startsWith('http'));
  const sites = customUrls.length > 0 
    ? customUrls.map((url, i) => ({ name: `Site ${i + 1}`, url }))
    : COMPETITORS;

  console.log(`\n🔄 Comparando ${sites.length} sites...\n`);

  const analysis = new CompetitiveAnalysis(sites);
  await analysis.analyzeAll();
  analysis.printComparison();

  // Exportar dados
  const timestamp = new Date().toISOString().split('T')[0];
  analysis.exportJSON(`seo-comparison-${timestamp}.json`);
  analysis.exportCSV(`seo-comparison-${timestamp}.csv`);
}

main().catch(console.error);
