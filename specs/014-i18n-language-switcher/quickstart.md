# Quickstart: Internacionalização com Seletor de Idiomas

**Feature**: 014-i18n-language-switcher  
**Date**: 2026-08-10  
**Purpose**: Guia rápido de desenvolvimento — setup, comandos, e verificação

---

## Pré-requisitos

- Node.js 20+
- Projeto Interasis AI Web clonado e com `npm install` executado
- Branch `014-i18n-language-switcher`

---

## 1. Instalar Dependências

```bash
npm install next-intl@^4
```

---

## 2. Estrutura de Diretórios a Criar

```bash
mkdir -p src/i18n/locales/{pt-BR,en,es}
mkdir -p src/app/\[locale\]/sobre
mkdir -p src/app/\[locale\]/politica-de-privacidade
mkdir -p src/app/\[locale\]/termos
mkdir -p src/app/\[locale\]/admin/tenants
mkdir -p src/app/\[locale\]/admin/whatsapp/\[instanceName\]/qrcode
```

---

## 3. Arquivos Chave a Criar (em ordem)

### 3.1. `src/i18n/config.ts`
```typescript
import { type LocaleMeta } from "@/i18n/types";

export const locales = ["pt-BR", "en", "es"] as const;
export type LocaleCode = (typeof locales)[number];
export const defaultLocale: LocaleCode = "en";

export const localeMeta: Record<LocaleCode, LocaleMeta> = {
  "pt-BR": { code: "pt-BR", flag: "🇧🇷", nativeName: "Português", dir: "ltr" },
  en:      { code: "en",    flag: "🇺🇸", nativeName: "English",   dir: "ltr" },
  es:      { code: "es",    flag: "🇪🇸", nativeName: "Español",   dir: "ltr" },
};
```

### 3.2. `src/i18n/request.ts`
```typescript
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`./locales/${locale}/common.json`)).default,
  };
});
```

### 3.3. `src/i18n/routing.ts`
```typescript
import { defineRouting } from "next-intl/routing";
import { locales, defaultLocale } from "./config";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
});
```

### 3.4. `src/middleware.ts` (RAIZ do projeto)
```typescript
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { defaultLocale, locales, type LocaleCode } from "@/i18n/config";

const intlMiddleware = createMiddleware(routing);

const COUNTRY_TO_LOCALE: Record<string, LocaleCode> = {
  BR: "pt-BR",
  US: "en", GB: "en", CA: "en", AU: "en", NZ: "en", IE: "en",
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es",
  VE: "es", EC: "es", GT: "es", CU: "es", BO: "es", DO: "es",
  HN: "es", PY: "es", SV: "es", NI: "es", CR: "es", PA: "es",
  UY: "es", GQ: "es",
};

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip API routes and static assets
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/") || pathname.match(/\.\w+$/)) {
    return NextResponse.next();
  }

  // Geo-IP detection for first visit (no cookie yet)
  const localeCookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (!localeCookie || !locales.includes(localeCookie as LocaleCode)) {
    const country = request.headers.get("x-vercel-ip-country")
      ?? request.headers.get("cf-ipcountry")
      ?? request.headers.get("x-geo-country");
    if (country) {
      const detected = COUNTRY_TO_LOCALE[country.toUpperCase()];
      if (detected && !localeCookie) {
        const url = request.nextUrl.clone();
        if (!pathname.match(/^\/(pt-BR|en|es)\//) && !locales.includes(pathname.split("/")[1] as LocaleCode)) {
          url.pathname = `/${detected}${pathname === "/" ? "" : pathname}`;
          const response = NextResponse.redirect(url);
          response.cookies.set("NEXT_LOCALE", detected, { maxAge: 31536000, path: "/" });
          return response;
        }
      }
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|images).*)"],
};
```

---

## 4. Migração de Rotas

### 4.1. Mover rotas existentes para `[locale]`

```bash
# Mover home page
mv src/app/page.tsx src/app/\[locale\]/page.tsx
mv src/app/page.test.tsx src/app/\[locale\]/page.test.tsx

# Mover páginas institucionais
mv src/app/sobre/page.tsx src/app/\[locale\]/sobre/page.tsx
mv src/app/politica-de-privacidade/page.tsx src/app/\[locale\]/politica-de-privacidade/page.tsx
mv src/app/termos/page.tsx src/app/\[locale\]/termos/page.tsx

# Mover admin (se for locale-aware; API routes ficam fora)
mv src/app/admin/layout.tsx src/app/\[locale\]/admin/layout.tsx
mv src/app/admin/page.tsx src/app/\[locale\]/admin/page.tsx
mv src/app/admin/tenants/page.tsx src/app/\[locale\]/admin/tenants/page.tsx
mv src/app/admin/whatsapp/layout.tsx src/app/\[locale\]/admin/whatsapp/layout.tsx
mv src/app/admin/whatsapp/page.tsx src/app/\[locale\]/admin/whatsapp/page.tsx
mv src/app/admin/whatsapp/\[instanceName\] src/app/\[locale\]/admin/whatsapp/\[instanceName\]

# Limpar diretórios antigos vazios
```

### 4.2. Atualizar `layout.tsx`

O novo root layout em `src/app/[locale]/layout.tsx` deve:
- Usar `next-intl` para setar `lang` dinamicamente
- Envolver conteúdo em `NextIntlClientProvider`
- Passar `locale` para metadados

### 4.3. Atualizar `globals.css`

Se o `globals.css` for importado do layout raiz antigo, manter no novo `[locale]/layout.tsx`.

---

## 5. Criar Dicionários de Tradução

Criar os arquivos JSON conforme o [i18n-contract.md](./contracts/i18n-contract.md).

Comando auxiliar para criar estrutura base:

```bash
for ns in common home about privacy terms chat admin validation; do
  for locale in pt-BR en es; do
    echo "{}" > "src/i18n/locales/${locale}/${ns}.json"
  done
done
```

Preencher com traduções reais (pt-BR como fonte primária a partir do código existente).

---

## 6. Criar Componente LanguageSwitcher

Arquivo: `src/components/layout/LanguageSwitcher.tsx`

Componente "use client" que:
1. Lê `locale` atual via `useLocale()` do next-intl
2. Renderiza dropdown com as 3 opções de `localeMeta`
3. Ao selecionar, navega via `useRouter().push(pathname, { locale: newLocale })`
4. Usa `AnimatePresence` para animação do dropdown
5. Estilo glassmorphism consistente

---

## 7. Criar Hook `useLanguageSwitch`

Arquivo: `src/hooks/useLanguageSwitch.ts`

Encapsula lógica de troca de idioma:
```typescript
export function useLanguageSwitch() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (newLocale: LocaleCode) => {
    if (newLocale === locale) return;
    router.replace(pathname, { locale: newLocale });
  };

  return { currentLocale: locale, switchTo };
}
```

---

## 8. Atualizar Componentes Existentes

Para cada componente com strings hardcoded:
1. Importar `useTranslations` (Client) ou `getTranslations` (Server)
2. Substituir strings literais por `t("chave")`
3. Adicionar chaves aos dicionários JSON correspondentes

### Exemplo: Header.tsx (Client Component)

```typescript
// Antes
<button aria-label="Ativar tema claro">...</button>

// Depois
import { useTranslations } from "next-intl";
const t = useTranslations("common");
<button aria-label={t("theme.light")}>...</button>
```

### Exemplo: page.tsx (Server Component)

```typescript
// Antes
export const metadata: Metadata = { title: "Interasis AI | ..." };

// Depois
import { getTranslations } from "next-intl/server";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("home");
  return { title: t("metadata.title") };
}
```

---

## 9. Script de Verificação de Tradução

Criar `scripts/check-i18n.ts`:

```typescript
// Verifica que todos os namespaces têm as mesmas chaves em todos os locales
import fs from "fs";
import path from "path";

const LOCALES = ["pt-BR", "en", "es"];
const LOCALES_DIR = path.resolve("src/i18n/locales");

function getKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  let keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      keys.push(...getKeys(v as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Para cada namespace, verifica consistência entre locales
const namespaces = fs.readdirSync(`${LOCALES_DIR}/pt-BR`).map(f => f.replace(".json", ""));
let errors = 0;

for (const ns of namespaces) {
  const keysByLocale: Record<string, string[]> = {};
  for (const locale of LOCALES) {
    const raw = JSON.parse(fs.readFileSync(`${LOCALES_DIR}/${locale}/${ns}.json`, "utf-8"));
    keysByLocale[locale] = getKeys(raw).sort();
  }
  const reference = keysByLocale["pt-BR"];
  for (const locale of ["en", "es"] as const) {
    const missing = reference.filter(k => !keysByLocale[locale].includes(k));
    const extra = keysByLocale[locale].filter(k => !reference.includes(k));
    if (missing.length > 0) {
      console.error(`[${ns}] Missing in ${locale}: ${missing.join(", ")}`);
      errors++;
    }
    if (extra.length > 0) {
      console.warn(`[${ns}] Extra in ${locale}: ${extra.join(", ")}`);
    }
  }
}

process.exit(errors > 0 ? 1 : 0);
```

Adicionar ao `package.json`:
```json
"scripts": {
  "check-i18n": "npx tsx scripts/check-i18n.ts"
}
```

---

## 10. Verificação Final

```bash
# 1. Verificar traduções
npm run check-i18n

# 2. Rodar testes
npm test

# 3. Rodar build
npm run build

# 4. Iniciar dev e testar manualmente
npm run dev
# Acessar: http://localhost:3000 (deve redirecionar para /en ou locale detectado)
# Testar seletor de idiomas no header
# Verificar todas as páginas nos 3 idiomas
```

---

## Troubleshooting

| Problema | Causa Provável | Solução |
|----------|---------------|---------|
| `Module not found: next-intl` | Dependência não instalada | `npm install next-intl` |
| Página 404 após mover rotas | Rota não está em `[locale]/` | Verificar estrutura de `src/app/[locale]/` |
| Middleware não executa | `matcher` incorreto ou rota excluída | Verificar config do middleware |
| Strings não traduzidas | Chave ausente no dicionário JSON | Rodar `npm run check-i18n` |
| Geo-IP não detecta | Headers ausentes (dev local) | Simular com `curl -H "x-vercel-ip-country: BR"` |
| CSP bloqueia inline | Headers existentes conflitando | Verificar `next.config.ts` CSP |
