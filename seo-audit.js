const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cheerio = require('cheerio');

async function auditSEO() {
  const url = 'https://www.interasisai.com.br';
  console.log(`🔍 Auditando SEO de: ${url}\n`);

  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    const loadTime = Date.now() - startTime;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // ===== META TAGS =====
    const metaTags = {
      title: $('title').text() || 'NÃO ENCONTRADA',
      description: $('meta[name="description"]').attr('content') || 'NÃO ENCONTRADA',
      keywords: $('meta[name="keywords"]').attr('content') || 'NÃO ENCONTRADA',
      ogTitle: $('meta[property="og:title"]').attr('content') || '-',
      ogDescription: $('meta[property="og:description"]').attr('content') || '-',
      ogImage: $('meta[property="og:image"]').attr('content') || '-',
      ogUrl: $('meta[property="og:url"]').attr('content') || '-',
      twitterCard: $('meta[name="twitter:card"]').attr('content') || '-',
      viewport: $('meta[name="viewport"]').attr('content') || 'NÃO ENCONTRADA',
      charset: $('meta[charset]').attr('charset') || 'UTF-8',
      canonical: $('link[rel="canonical"]').attr('href') || '-',
      htmlLang: $('html').attr('lang') || 'NÃO DEFINIDO'
    };

    // ===== HEADINGS =====
    const h1s = [];
    $('h1').each((i, el) => {
      h1s.push({
        text: $(el).text().trim(),
        length: $(el).text().trim().length
      });
    });

    const h2s = [];
    $('h2').each((i, el) => {
      if (i < 5) { // Apenas primeiros 5
        h2s.push({
          text: $(el).text().trim(),
          length: $(el).text().trim().length
        });
      }
    });

    const h2Count = $('h2').length;
    const h3Count = $('h3').length;

    // ===== IMAGENS =====
    const images = [];
    $('img').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || '-';
      const alt = $(el).attr('alt') || 'SEM ALT TEXT ⚠️';
      const hasAlt = !!$(el).attr('alt');
      
      images.push({ src, alt, hasAlt });
    });

    const missingAltCount = images.filter(img => !img.hasAlt).length;

    // ===== LINKS =====
    let internalCount = 0;
    let externalCount = 0;
    let noFollowCount = 0;
    let totalLinks = 0;

    $('a').each((i, el) => {
      const href = $(el).attr('href');
      const rel = $(el).attr('rel') || '';
      
      if (href) {
        totalLinks++;
        
        if (rel.includes('nofollow')) noFollowCount++;
        
        if (href.startsWith('/') || href.includes('interasisai.com.br')) {
          internalCount++;
        } else if (href.startsWith('http')) {
          externalCount++;
        }
      }
    });

    // ===== CONTEÚDO =====
    const text = $('body').text();
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const charCount = text.length;
    const paragraphCount = $('p').length;

    // ===== ESTRUTURA =====
    const hasH1 = h1s.length > 0;
    const hasNav = $('nav').length > 0;
    const hasMain = $('main').length > 0;
    const hasFooter = $('footer').length > 0;
    const hasSchema = $('script[type="application/ld+json"]').length > 0;

    // ===== ACESSIBILIDADE =====
    const duplicateIds = {};
    $('[id]').each((i, el) => {
      const id = $(el).attr('id');
      duplicateIds[id] = (duplicateIds[id] || 0) + 1;
    });
    const duplicateIdsList = Object.keys(duplicateIds).filter(id => duplicateIds[id] > 1);

    let missingLabels = 0;
    $('input, select, textarea').each((i, el) => {
      const id = $(el).attr('id');
      const inLabel = $(el).parent('label').length > 0;
      const hasLabel = id && $(`label[for="${id}"]`).length > 0;
      
      if (!inLabel && !hasLabel) {
        missingLabels++;
      }
    });

    // ===== GERAR RELATÓRIO =====
    console.log('═'.repeat(60));
    console.log('📊 AUDITORIA SEO - INTERASIS AI');
    console.log('═'.repeat(60));

    console.log('\n🏷️  META TAGS:');
    console.log(`  Title: "${metaTags.title}" (${metaTags.title.length} chars)`);
    const descPreview = metaTags.description.substring(0, 80);
    console.log(`  Description: "${descPreview}${metaTags.description.length > 80 ? '...' : ''}" (${metaTags.description.length} chars)`);
    console.log(`  Keywords: ${metaTags.keywords === 'NÃO ENCONTRADA' ? '❌ ' : '✅ '}${metaTags.keywords === 'NÃO ENCONTRADA' ? 'Não definidas' : metaTags.keywords}`);
    console.log(`  Viewport: ${metaTags.viewport === 'NÃO ENCONTRADA' ? '❌' : '✅'} ${metaTags.viewport}`);
    console.log(`  Canonical: ${metaTags.canonical !== '-' ? '✅' : '⚠️ Não definida'}`);
    console.log(`  Lang: ${metaTags.htmlLang !== 'NÃO DEFINIDO' ? '✅ ' + metaTags.htmlLang : '❌ Não definido'}`);

    console.log('\n🔗 OPEN GRAPH (Redes Sociais):');
    console.log(`  OG Title: ${metaTags.ogTitle !== '-' ? '✅' : '❌'}`);
    console.log(`  OG Description: ${metaTags.ogDescription !== '-' ? '✅' : '❌'}`);
    console.log(`  OG Image: ${metaTags.ogImage !== '-' ? '✅' : '❌'}`);
    console.log(`  OG URL: ${metaTags.ogUrl !== '-' ? '✅' : '❌'}`);

    console.log('\n📰 ESTRUTURA DE CONTEÚDO:');
    console.log(`  H1 Tags: ${h1s.length} ${h1s.length === 1 ? '✅' : h1s.length === 0 ? '❌' : '⚠️ (ideal: 1)'}`);
    if (h1s.length > 0) {
      h1s.forEach(h1 => console.log(`    - "${h1.text}"`));
    }
    console.log(`  H2 Tags: ${h2Count}`);
    if (h2s.length > 0) {
      h2s.forEach(h2 => {
        const preview = h2.text.length > 60 ? h2.text.substring(0, 60) + '...' : h2.text;
        console.log(`    - "${preview}"`);
      });
    }
    console.log(`  H3 Tags: ${h3Count}`);
    console.log(`  Paragraphs: ${paragraphCount}`);

    console.log('\n🖼️  IMAGENS:');
    console.log(`  Total: ${images.length}`);
    console.log(`  Sem alt text: ${missingAltCount} ${missingAltCount === 0 ? '✅' : '❌'}`);
    if (images.length > 0) {
      console.log('  Amostra (primeiras 5):');
      images.slice(0, 5).forEach(img => {
        console.log(`    - ${img.alt}`);
      });
    }

    console.log('\n🔗 LINKS:');
    console.log(`  Total de links: ${totalLinks}`);
    console.log(`  Internos: ${internalCount}`);
    console.log(`  Externos: ${externalCount}`);
    console.log(`  Com noFollow: ${noFollowCount}`);

    console.log('\n📝 CONTEÚDO:');
    console.log(`  Palavras: ${wordCount}`);
    console.log(`  Caracteres: ${charCount}`);
    console.log(`  Densidade de conteúdo: ${((charCount / 1000).toFixed(1))}KB`);

    console.log('\n⚙️  PERFORMANCE:');
    console.log(`  Tempo de resposta: ${loadTime}ms ${loadTime < 2000 ? '✅' : loadTime < 3000 ? '⚠️' : '❌'}`);

    console.log('\n♿ ACESSIBILIDADE:');
    console.log(`  HTML Lang: ${metaTags.htmlLang !== 'NÃO DEFINIDO' ? '✅' : '❌'}`);
    console.log(`  Main Element: ${hasMain ? '✅' : '⚠️'}`);
    console.log(`  Nav Element: ${hasNav ? '✅' : '⚠️'}`);
    console.log(`  Footer Element: ${hasFooter ? '✅' : '⚠️'}`);
    console.log(`  IDs Duplicados: ${duplicateIdsList.length === 0 ? '✅' : '❌ ' + duplicateIdsList.length}`);
    console.log(`  Inputs sem label: ${missingLabels === 0 ? '✅' : '⚠️ ' + missingLabels}`);

    console.log('\n📱 MOBILE & RESPONSIVE:');
    console.log(`  Viewport Meta: ${metaTags.viewport !== 'NÃO ENCONTRADA' ? '✅' : '❌'}`);

    console.log('\n🏗️  ESTRUTURA:');
    console.log(`  Schema.org (JSON-LD): ${hasSchema ? '✅' : '❌'}`);

    // ===== SCORE GERAL =====
    let score = 0;
    let maxScore = 0;

    const checks = [
      { name: 'Title entre 30-60 chars', value: metaTags.title.length >= 30 && metaTags.title.length <= 60, weight: 1 },
      { name: 'Description entre 120-160 chars', value: metaTags.description.length >= 120 && metaTags.description.length <= 160, weight: 1 },
      { name: 'Keywords definidas', value: metaTags.keywords !== 'NÃO ENCONTRADA', weight: 0.5 },
      { name: 'Exatamente 1 H1', value: h1s.length === 1, weight: 2 },
      { name: 'Viewport definida', value: metaTags.viewport !== 'NÃO ENCONTRADA', weight: 1.5 },
      { name: 'Lang definida', value: metaTags.htmlLang !== 'NÃO DEFINIDO', weight: 1 },
      { name: 'Canonical definida', value: metaTags.canonical !== '-', weight: 1 },
      { name: 'OG Tags completas', value: metaTags.ogTitle !== '-' && metaTags.ogDescription !== '-' && metaTags.ogImage !== '-', weight: 1 },
      { name: 'Imagens com alt text', value: missingAltCount === 0, weight: 1.5 },
      { name: 'Conteúdo > 300 palavras', value: wordCount > 300, weight: 1 },
      { name: 'Velocidade < 2s', value: loadTime < 2000, weight: 1 },
      { name: 'Main element', value: hasMain, weight: 1 },
      { name: 'Schema Markup', value: hasSchema, weight: 1 },
      { name: 'Sem IDs duplicados', value: duplicateIdsList.length === 0, weight: 0.5 }
    ];

    checks.forEach(check => {
      maxScore += check.weight;
      if (check.value) score += check.weight;
    });

    const percentage = ((score / maxScore) * 100).toFixed(0);
    const scoreBadge = percentage >= 80 ? '🟢' : percentage >= 60 ? '🟡' : '🔴';

    console.log('\n' + '═'.repeat(60));
    console.log(`${scoreBadge} SCORE SEO: ${percentage}/100`);
    console.log('═'.repeat(60));

    console.log('\n✨ RECOMENDAÇÕES DE MELHORIA:');
    console.log('═'.repeat(60));

    const recommendations = [];

    if (metaTags.title.length < 30 || metaTags.title.length > 60) {
      recommendations.push(`1. 📌 Title ${metaTags.title.length < 30 ? 'muito curto' : 'muito longo'} (${metaTags.title.length} chars). Ideal: 30-60`);
    }

    if (metaTags.description.length < 120 || metaTags.description.length > 160) {
      recommendations.push(`2. 📌 Meta description fora do ideal (${metaTags.description.length} chars). Recomendado: 120-160`);
    }

    if (h1s.length !== 1) {
      recommendations.push(`3. 📌 Deve haver exatamente 1 H1 por página (atualmente ${h1s.length})`);
    }

    if (missingAltCount > 0) {
      recommendations.push(`4. 📌 ${missingAltCount} imagem(ns) sem alt text. Importante para SEO e acessibilidade`);
    }

    if (metaTags.ogImage === '-') {
      recommendations.push('5. 📌 Adicionar OG Image para melhor aparência em redes sociais');
    }

    if (loadTime > 3000) {
      recommendations.push(`6. 📌 Página carrega em ${loadTime}ms. Objetivo: < 2000ms`);
    }

    if (wordCount < 300) {
      recommendations.push(`7. 📌 Conteúdo pode ser mais completo (${wordCount} palavras). Recomendado: 300+ palavras`);
    }

    if (!hasSchema) {
      recommendations.push('8. 📌 Adicionar Schema Markup (JSON-LD) para melhorar rich snippets nos resultados de busca');
    }

    if (!hasMain) {
      recommendations.push('9. 📌 Adicionar <main> tag para melhor estrutura semântica');
    }

    if (metaTags.canonical === '-') {
      recommendations.push('10. 📌 Definir Canonical URL para evitar conteúdo duplicado');
    }

    if (metaTags.htmlLang === 'NÃO DEFINIDO') {
      recommendations.push('11. 📌 Definir atributo lang no elemento <html> (ex: lang="pt-BR")');
    }

    if (recommendations.length === 0) {
      console.log('✅ Parabéns! Seu SEO está muito bom! Nenhuma recomendação crítica.');
    } else {
      recommendations.forEach(rec => console.log(`   ${rec}`));
    }

    console.log('\n' + '═'.repeat(60));
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('═'.repeat(60));
    console.log('1. Implemente as recomendações acima');
    console.log('2. Use Google Search Console para monitorar indexação');
    console.log('3. Analise Core Web Vitals com PageSpeed Insights');
    console.log('4. Configure Google Analytics 4');
    console.log('5. Teste estruturado de dados com Test Rich Results');
    console.log('6. Otimize imagens com ferramentas como TinyPNG');
    console.log('7. Implemente breadcrumbs schema');
    console.log('\n');

  } catch (error) {
    console.error('❌ Erro ao auditar:', error.message);
  }
}

auditSEO();