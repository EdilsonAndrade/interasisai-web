#!/usr/bin/env node

/**
 * SEO Audit Monitor - Script reutilizável
 * Uso: node seo-monitor.js <url> [--json]
 * Exemplos:
 *   node seo-monitor.js https://www.interasisai.com.br
 *   node seo-monitor.js https://seu-site.com --json > audit.json
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class SEOAuditor {
  constructor(url) {
    this.url = url;
    this.results = {};
  }

  async audit() {
    let browser;
    try {
      browser = await puppeteer.launch({ headless: 'new' });
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });

      const startTime = Date.now();
      await page.goto(this.url, { waitUntil: 'networkidle2', timeout: 30000 });
      const loadTime = Date.now() - startTime;

      // Coletar dados
      this.results = {
        url: this.url,
        timestamp: new Date().toISOString(),
        loadTime,
        metrics: await this.getMetrics(page),
        content: await this.getContent(page),
        structure: await this.getStructure(page),
        accessibility: await this.getAccessibility(page)
      };

      // Calcular score
      this.results.score = this.calculateScore();
      this.results.recommendations = this.getRecommendations();

      return this.results;
    } finally {
      if (browser) await browser.close();
    }
  }

  async getMetrics(page) {
    return await page.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '❌',
      keywords: document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '❌',
      viewport: !!document.querySelector('meta[name="viewport"]'),
      canonical: !!document.querySelector('link[rel="canonical"]'),
      lang: document.documentElement.getAttribute('lang'),
      ogTitle: !!document.querySelector('meta[property="og:title"]'),
      ogImage: !!document.querySelector('meta[property="og:image"]'),
      ogUrl: !!document.querySelector('meta[property="og:url"]'),
      schema: !!document.querySelector('script[type="application/ld+json"]'),
      charset: !!document.querySelector('meta[charset]')
    }));
  }

  async getContent(page) {
    return await page.evaluate(() => {
      const text = document.body.innerText;
      const words = text.split(/\s+/).filter(w => w.length > 0);
      return {
        wordCount: words.length,
        characterCount: text.length,
        paragraphs: document.querySelectorAll('p').length
      };
    });
  }

  async getStructure(page) {
    return await page.evaluate(() => ({
      h1Count: document.querySelectorAll('h1').length,
      h2Count: document.querySelectorAll('h2').length,
      h3Count: document.querySelectorAll('h3').length,
      imageCount: document.querySelectorAll('img').length,
      imagesWithoutAlt: Array.from(document.querySelectorAll('img')).filter(img => !img.alt).length,
      linkCount: document.querySelectorAll('a').length,
      hasMain: !!document.querySelector('main'),
      hasNav: !!document.querySelector('nav'),
      hasFooter: !!document.querySelector('footer')
    }));
  }

  async getAccessibility(page) {
    return await page.evaluate(() => {
      const ids = {};
      document.querySelectorAll('[id]').forEach(el => {
        ids[el.id] = (ids[el.id] || 0) + 1;
      });
      const duplicateIds = Object.keys(ids).filter(id => ids[id] > 1);

      return {
        duplicateIds: duplicateIds.length,
        inputsWithoutLabel: Array.from(document.querySelectorAll('input, select, textarea'))
          .filter(el => !el.closest('label') && !document.querySelector(`label[for="${el.id}"]`)).length
      };
    });
  }

  calculateScore() {
    let score = 50; // Começar com 50
    const metrics = this.results.metrics;
    const structure = this.results.structure;
    const content = this.results.content;

    // Meta tags (20 pontos)
    if (metrics.title) score += 5;
    if (metrics.description !== '❌') score += 5;
    if (metrics.keywords !== '❌') score += 2;
    if (metrics.viewport) score += 3;
    if (metrics.canonical) score += 5;

    // Estrutura (20 pontos)
    if (structure.h1Count === 1) score += 8;
    if (structure.h2Count >= 2) score += 5;
    if (structure.hasMain && structure.hasNav) score += 7;

    // Conteúdo (15 pontos)
    if (content.wordCount > 300) score += 8;
    if (structure.imageCount > 0 && structure.imagesWithoutAlt === 0) score += 7;

    // Open Graph (10 pontos)
    if (metrics.ogTitle && metrics.ogImage) score += 10;

    // Schema (10 pontos)
    if (metrics.schema) score += 10;

    // Acessibilidade (15 pontos)
    if (this.results.accessibility.duplicateIds === 0) score += 8;
    if (this.results.accessibility.inputsWithoutLabel === 0) score += 7;

    return Math.min(100, score);
  }

  getRecommendations() {
    const recs = [];
    const m = this.results.metrics;
    const s = this.results.structure;
    const c = this.results.content;

    if (!m.title || m.title.length < 30 || m.title.length > 60) {
      recs.push({ priority: 'alto', text: 'Otimizar title (30-60 chars)' });
    }
    if (m.description === '❌') {
      recs.push({ priority: 'alto', text: 'Adicionar meta description (120-160 chars)' });
    }
    if (m.keywords === '❌') {
      recs.push({ priority: 'médio', text: 'Adicionar keywords relevantes' });
    }
    if (s.h1Count !== 1) {
      recs.push({ priority: 'alto', text: `Deve haver 1 H1 (atualmente ${s.h1Count})` });
    }
    if (s.imagesWithoutAlt > 0) {
      recs.push({ priority: 'alto', text: `${s.imagesWithoutAlt} imagem(ns) sem alt text` });
    }
    if (c.wordCount < 300) {
      recs.push({ priority: 'médio', text: `Aumentar conteúdo (${c.wordCount} palavras)` });
    }
    if (!m.schema) {
      recs.push({ priority: 'baixo', text: 'Adicionar Schema Markup (JSON-LD)' });
    }

    return recs;
  }

  printReport() {
    console.log('\n' + '═'.repeat(70));
    console.log('📊 SEO AUDIT REPORT');
    console.log('═'.repeat(70));
    console.log(`\n🔗 URL: ${this.url}`);
    console.log(`📅 Data: ${new Date(this.results.timestamp).toLocaleString('pt-BR')}`);

    // Score
    const score = this.results.score;
    const badge = score >= 80 ? '🟢' : score >= 70 ? '🟡' : '🔴';
    console.log(`\n${badge} SCORE SEO: ${score}/100`);

    // Performance
    const perf = this.results.loadTime;
    console.log(`⚙️  Performance: ${perf}ms ${perf < 2000 ? '✅' : perf < 3000 ? '⚠️' : '❌'}`);

    // Meta Tags
    console.log('\n🏷️  META TAGS:');
    console.log(`  Title: ${this.results.metrics.title ? '✅' : '❌'}`);
    console.log(`  Description: ${this.results.metrics.description !== '❌' ? '✅' : '❌'}`);
    console.log(`  Keywords: ${this.results.metrics.keywords !== '❌' ? '✅' : '❌'}`);
    console.log(`  Viewport: ${this.results.metrics.viewport ? '✅' : '❌'}`);
    console.log(`  Canonical: ${this.results.metrics.canonical ? '✅' : '❌'}`);

    // Estrutura
    console.log('\n📰 ESTRUTURA:');
    console.log(`  H1 Tags: ${this.results.structure.h1Count} ${this.results.structure.h1Count === 1 ? '✅' : '❌'}`);
    console.log(`  H2 Tags: ${this.results.structure.h2Count}`);
    console.log(`  Main/Nav: ${this.results.structure.hasMain && this.results.structure.hasNav ? '✅' : '⚠️'}`);

    // Conteúdo
    console.log('\n📝 CONTEÚDO:');
    console.log(`  Palavras: ${this.results.content.wordCount} ${this.results.content.wordCount > 300 ? '✅' : '⚠️'}`);
    console.log(`  Imagens: ${this.results.structure.imageCount}`);
    console.log(`  Sem alt text: ${this.results.structure.imagesWithoutAlt} ${this.results.structure.imagesWithoutAlt === 0 ? '✅' : '❌'}`);

    // Recomendações
    if (this.results.recommendations.length > 0) {
      console.log('\n✨ RECOMENDAÇÕES:');
      this.results.recommendations.forEach((rec, i) => {
        const icon = rec.priority === 'alto' ? '🔴' : rec.priority === 'médio' ? '🟡' : '🟢';
        console.log(`  ${i + 1}. ${icon} ${rec.text}`);
      });
    }

    console.log('\n' + '═'.repeat(70) + '\n');
  }

  saveJSON(filename) {
    fs.writeFileSync(filename, JSON.stringify(this.results, null, 2));
    console.log(`✅ Relatório salvo em: ${filename}`);
  }
}

// Main
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Uso: node seo-monitor.js <url> [--json]');
    console.log('Exemplos:');
    console.log('  node seo-monitor.js https://www.interasisai.com.br');
    console.log('  node seo-monitor.js https://seu-site.com --json > audit.json');
    process.exit(1);
  }

  const url = args[0];
  const jsonFlag = args.includes('--json');

  try {
    const auditor = new SEOAuditor(url);
    console.log(`🔍 Auditando: ${url}\n`);
    
    await auditor.audit();

    if (jsonFlag) {
      console.log(JSON.stringify(auditor.results, null, 2));
    } else {
      auditor.printReport();
      
      // Salvar também em arquivo
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `seo-audit-${timestamp}.json`;
      auditor.saveJSON(filename);
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
