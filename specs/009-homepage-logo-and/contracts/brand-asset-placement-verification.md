# Contract — Brand Asset Placement Verification

**Feature**: 009-homepage-logo-and
**Date**: 2026-04-30
**Type**: UI / a11y / performance verification contract (no external API).

Este contrato define os critérios de verificação automatizada e manual que comprovam o cumprimento de cada FR/SC da [spec.md](../spec.md). É consumido por `/speckit.tasks` para gerar tarefas de teste e validação.

## 1. Contratos de UI (renderização — testes automatizados)

### 1.1 `BrandLogo` (componente novo)

| Caso | Entrada | Saída esperada |
|---|---|---|
| `variant="header"` sem `href` | `<BrandLogo variant="header" />` | Renderiza `<img>` com `alt="Interasis AI"`, altura aplicada (~36px). |
| `variant="header"` com `href="/"` | `<BrandLogo variant="header" href="/" />` | Renderiza `<a aria-label="Interasis AI - Página inicial">` envolvendo `<img alt="">`. Único nome acessível: "Interasis AI - Página inicial". |
| `variant="footer"` | `<BrandLogo variant="footer" />` | Renderiza `<img>` com `alt="Interasis AI"`, altura ~52px. |
| Erro de carregamento | dispara `onError` na imagem | Renderiza fallback textual `<span>Interasis AI</span>` (ou mantém `<h2>` no contexto do footer). |
| `className` adicional | `<BrandLogo variant="header" className="opacity-80" />` | Classes mescladas via `tailwind-merge` sem conflitos com classes internas. |

**Arquivo de teste**: `src/components/ui/BrandLogo.test.tsx`

### 1.2 `Header.tsx`

| Caso | Verificação |
|---|---|
| Substituição do texto | `getByRole("link", { name: "Interasis AI - Página inicial" })` está no documento. |
| Texto antigo ausente | Não existe link com texto literal "Interasis AI" como `textContent` (apenas via accessible name). |
| Link de marca aponta para `/` | `closest("a").getAttribute("href") === "/"` (ou `#top`, conforme decisão de implementação — alinhar a tasks). |
| Resto do header preservado | Itens de navegação (`navigationItems`) ainda renderizam; toggle de tema continua funcional. |

**Arquivo**: `src/components/layout/Header.test.tsx` (atualizar testes existentes).

### 1.3 `Footer.tsx`

| Caso | Verificação |
|---|---|
| Logo presente | `getByAltText("Interasis AI")` no escopo do footer. |
| Texto e contato preservados | "contato@interasis.ai" e `© <year> Interasis AI` continuam no DOM. |
| Hierarquia semântica | Continua existindo um único `<footer>` semântico. |

**Arquivo**: `src/components/layout/Footer.test.tsx` (atualizar).

### 1.4 `page.tsx` (home)

| Caso | Verificação |
|---|---|
| Cover renderizada | `getByRole("img", { name: /Inteligência que conecta\. Tecnologia que transforma\./i })` no `data-testid="hero-section"`. |
| Hero contém H1 + CTAs | `getByRole("heading", { level: 1 })` e dois CTAs (`cta-primary`, `cta-secondary`) presentes (asserts já existentes). |
| Layout de duas colunas (desktop) | `data-testid="hero-section"` contém um container com classes de grid 2-col aplicáveis em `lg:` (verificação de classe ou estrutura — não pixel). |
| Sem regressão de seções | `services-section` e cards de feature continuam presentes. |

**Arquivo**: `src/app/page.test.tsx` (atualizar).

## 2. Contratos de metadados (Open Graph)

| Caso | Verificação |
|---|---|
| `metadata.openGraph.images` existe na home | Em `src/app/page.tsx`, exportar `metadata` com `openGraph.images: [{ url, width, height, alt }]`. |
| `url` aponta para a cover | `url === "/images/interasisai_coverpage.png"` (ou URL absoluta equivalente em produção). |
| `width` e `height` definidos | `width: 1200`, `height: 630`. |
| `alt` em pt-BR e descritivo | Não-vazio, contém pelo menos "Interasis AI". |

**Verificação automatizada (opcional)**: teste unitário que importa `metadata` de `page.tsx` e valida o objeto.

## 3. Contratos de favicons (Next.js convention)

| Caso | Verificação |
|---|---|
| `src/app/icon.png` existe | Arquivo presente; navegador carrega `<link rel="icon">` automaticamente injetado pelo Next. |
| `src/app/apple-icon.png` existe | Arquivo presente; gera `<link rel="apple-touch-icon">`. |
| Visualização do favicon na aba | Manual — abrir `/` e verificar que o favicon mostra o símbolo do logotipo. |

## 4. Contratos de acessibilidade

| Critério | Método |
|---|---|
| Único nome acessível para link de marca no header | RTL: `screen.getAllByRole("link", { name: "Interasis AI - Página inicial" }).length === 1`. |
| `alt` não vazio em todas as imagens não decorativas | RTL/axe: nenhuma `<img>` com `alt=""` exceto a aninhada em link rotulado. |
| Hierarquia de headings preservada | Um único `<h1>` na home; H2/H3 sem saltos. |
| `prefers-reduced-motion` | Manual: simular `(prefers-reduced-motion: reduce)` no DevTools — sem animações contínuas (parallax, loops). `FadeIn` existente já respeita; nenhuma nova animação contínua é adicionada. |
| Contraste AA | Manual via Lighthouse Accessibility ≥95 e auditoria axe DevTools — sem novos avisos de contraste. |

## 5. Contratos de performance

| Métrica | Alvo | Método |
|---|---|---|
| LCP da home | ≤2,5s (mobile 4G simulado) | Lighthouse mobile, 3 execuções, mediana. |
| ΔLCP vs. baseline | <200ms | Comparar com baseline pré-merge documentado no PR. |
| CLS total | <0,1 | Lighthouse. |
| CLS contribuído pelo hero | <0,05 | Inspeção via Performance DevTools — nenhuma reflow após carregamento da cover (graças a `width`/`height` ou `aspect-ratio`). |
| Tamanho transferido da cover | razoável para LCP | `next/image` deve servir AVIF/WebP automaticamente; verificar Network tab. |

## 6. Contratos de robustez (degradação)

| Cenário | Comportamento esperado |
|---|---|
| Asset 404 (logo) no header | `BrandLogo` aciona fallback `"text"`; layout não quebra. Verificável em RTL via `fireEvent.error`. |
| Asset 404 (cover) no hero | A `<Image />` com `onError` esconde-se (estilo `display:none` ou wrapper condicional); hero exibe apenas o gradiente. Verificável em RTL. |
| Asset 404 (logo) no footer | `BrandLogo variant="footer"` aciona fallback; `<h2>Interasis AI</h2>` (ou texto equivalente) é exibido. |

## 7. Cobertura cruzada FR ↔ Verificações

| FR | Verificação |
|---|---|
| FR-001..FR-006 | §1.4, §5 |
| FR-007..FR-009 | §1.1, §1.2, §4 |
| FR-010..FR-011 | §1.3, §4 |
| FR-012 | §3 |
| FR-013..FR-014 | §2 |
| FR-015 | §5 (next/image AVIF/WebP automático) |
| FR-016 | §5 (CLS) |
| FR-017 | §4 |
| FR-018 | §4 (`prefers-reduced-motion`) |
| FR-019 | §6 |
| FR-020 | §3, §1 (paths verificados nos testes) |

## 8. Cobertura SC ↔ Verificações

| SC | Verificação |
|---|---|
| SC-001 | §1, §4, snapshot manual em 375/768/1280px (quickstart). |
| SC-002 | §5 (LCP). |
| SC-003 | §5 (CLS). |
| SC-004 | §4 (a11y). |
| SC-005 | Manual: inspetores de OG (LinkedIn/WhatsApp/X). |
| SC-006 | Manual: teste de percepção n≥5 (fora do CI). |
| SC-007 | Suite Jest existente passa pós-edits (`npm test`). |
