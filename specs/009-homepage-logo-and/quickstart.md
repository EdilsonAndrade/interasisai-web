# Quickstart — Posicionamento do Logo e Cover Page na Home

**Feature**: 009-homepage-logo-and
**Date**: 2026-04-30
**Branch**: `009-homepage-logo-and`

Guia passo a passo para validar manualmente a feature após implementação. Use junto com a suíte automatizada (`npm test`) para cobertura completa.

## Pré-requisitos

- Node 18+ instalado.
- Repositório clonado, branch `009-homepage-logo-and` ativa.
- Dependências instaladas: `npm install`.
- Ativos presentes em `public/images/`:
  - `interasis_ai_logo.png`
  - `interasisai_coverpage.png`

## 1. Inferir dimensões nativas dos ativos (uma única vez)

Antes da implementação, capturar largura/altura nativas dos PNGs para uso em `width`/`height` do `next/image`:

```bash
# PowerShell ou bash com Node disponível
node -e "const sharp=require('sharp'); ['public/images/interasis_ai_logo.png','public/images/interasisai_coverpage.png'].forEach(p=>sharp(p).metadata().then(m=>console.log(p, m.width,'x',m.height)))"
```

Alternativa sem `sharp`: abrir cada arquivo em qualquer visualizador de imagem que mostre dimensões (Windows Explorer → Propriedades → Detalhes), ou usar `file` (macOS/Linux), ou abrir no navegador via `http://localhost:3000/images/...` e usar DevTools.

Anotar:

- `interasis_ai_logo.png`: `W × H` (esperado próximo de quadrado, ex.: 1024×768).
- `interasisai_coverpage.png`: `W × H` (esperado wide, ex.: 1920×720).

Atualizar `data-model.md` se necessário e usar esses valores no JSX.

## 2. Rodar a suíte de testes

```bash
npm test -- --watch=false
```

Esperado: todos os testes verdes, incluindo:

- `src/components/ui/BrandLogo.test.tsx` (novo)
- `src/components/layout/Header.test.tsx` (atualizado)
- `src/components/layout/Footer.test.tsx` (atualizado)
- `src/app/page.test.tsx` (atualizado)
- todos os testes pré-existentes intactos.

## 3. Subir o ambiente local

```bash
npm run dev
```

Abrir `http://localhost:3000`.

## 4. Validação visual — Hero (US1)

### 4.1 Desktop (≥1280px)

- [ ] Hero exibe **duas colunas**: texto/CTAs à esquerda, cover à direita.
- [ ] Cabeça humana em circuitos é visualmente o ponto focal direito.
- [ ] H1 e CTAs **não são** sobrepostos pela cover.
- [ ] Borda branca da cover **não aparece** retangular — está dissolvida pela máscara radial sobre o gradiente.
- [ ] Subtítulo continua legível em pt-BR.

### 4.2 Mobile (375px)

- [ ] Hero empilha vertical: bloco texto (H1, subtítulo, CTAs) **acima**, cover **abaixo**.
- [ ] Cover não excede ~45% da altura da viewport.
- [ ] CTAs continuam clicáveis com tap target ≥44px.
- [ ] H1 fica visível sem rolar (acima da dobra).

### 4.3 Tablet (768px)

- [ ] Layout ainda empilhado ou já em duas colunas (decisão de implementação documentada nas tasks). Em qualquer caso, sem sobreposição.

### 4.4 Reduced motion

- DevTools → Rendering → "Emulate CSS media feature `prefers-reduced-motion`" → `reduce`.
- [ ] Recarregar `/`. Nenhuma animação contínua. `FadeIn` aparece imediatamente ou com fade muito sutil/instantâneo.

## 5. Validação visual — Header (US2)

- [ ] Logotipo oficial visível no canto superior esquerdo (altura entre 32–40px).
- [ ] Clicar no logo navega para `/` (ou `#top`).
- [ ] Navegação, toggle de tema e CTA primário do header inalterados.
- [ ] Em mobile (≤768px), o menu hamburger continua funcionando.

### 5.1 Acessibilidade

- DevTools → Accessibility tree (ou extensão axe).
- [ ] O link de marca tem **um único** accessible name: `"Interasis AI - Página inicial"`.
- [ ] Foco visível por teclado (`Tab` até o logo).

## 6. Validação visual — Footer (US2)

- [ ] Logotipo oficial na coluna esquerda (altura entre 48–56px).
- [ ] Contraste contra `bg-brand-secondary` é confortável.
- [ ] Texto descritivo abaixo do logo continua presente.
- [ ] Demais colunas (Institucional, Contato, Redes) inalteradas.

## 7. Validação de Open Graph (US3)

### 7.1 Inspeção manual local

```bash
curl -s http://localhost:3000 | grep -i "og:image"
```

- [ ] Existe `<meta property="og:image" content="...interasisai_coverpage.png">`.
- [ ] Existe `<meta property="og:image:width" content="1200">` e `<meta property="og:image:height" content="630">`.
- [ ] Existe `<meta property="og:image:alt" content="...">` em pt-BR.

### 7.2 Inspeção em produção (após deploy)

- LinkedIn Post Inspector: `https://www.linkedin.com/post-inspector/inspect/<URL>`.
- WhatsApp: colar URL em uma conversa de teste.
- X/Twitter Card Validator (quando disponível).
- [ ] A prévia em pelo menos 3 plataformas mostra a cover page.

## 8. Validação de favicon (US3)

- [ ] Aba do navegador exibe o ícone com o símbolo do logotipo.
- [ ] DevTools → Application → Manifest/Icons (Next gera as referências automaticamente quando `app/icon.png` e `app/apple-icon.png` estão presentes).
- [ ] Em iOS Safari (ou simulador), adicionar à tela inicial → ícone exibido é o logotipo.

## 9. Performance — Lighthouse mobile

```bash
# Em outra aba, com o servidor dev rodando, ou (preferencialmente) com build de produção:
npm run build
npm run start
# Em outra janela:
npx lighthouse http://localhost:3000 --preset=desktop --only-categories=performance,accessibility
npx lighthouse http://localhost:3000 --form-factor=mobile --throttling.cpuSlowdownMultiplier=4 --only-categories=performance,accessibility
```

Targets:

- [ ] LCP ≤2,5s (mobile).
- [ ] CLS <0,1.
- [ ] Acessibilidade ≥95.
- [ ] Sem regressão >200ms em LCP vs. baseline anterior (anotar valores no PR).

## 10. Robustez (degradação)

Para cada cenário, verificar manualmente:

- **Logo 404 no header**: temporariamente renomear `public/images/interasis_ai_logo.png` para `interasis_ai_logo.bak.png`, recarregar `/`. O header deve mostrar o texto fallback "Interasis AI" sem erro de layout. Restaurar o arquivo.
- **Cover 404 no hero**: idem para `interasisai_coverpage.png`. O hero deve aparecer apenas com o gradiente, sem espaço vazio quebrado.

## 11. Resumo dos comandos

```bash
npm install
npm test -- --watch=false
npm run dev          # validação visual
npm run build && npm run start   # validação de produção / Lighthouse
```

## 12. Checklist final antes do PR

- [ ] Todos os testes Jest passam.
- [ ] Validação visual em ≥3 breakpoints (375, 768, 1280px).
- [ ] Lighthouse mobile dentro dos targets.
- [ ] axe DevTools sem regressões de a11y.
- [ ] Snapshot da home (desktop + mobile) anexado ao PR.
- [ ] Métricas de LCP/CLS anotadas no PR (antes vs. depois).
