# i18n Interface Contract: Translation Dictionary Schema

**Feature**: 014-i18n-language-switcher  
**Date**: 2026-08-10  
**Purpose**: Define o contrato de interface para os dicionários de tradução — o formato que todo namespace de tradução DEVE seguir

---

## TypeScript Contract

```typescript
// src/i18n/config.ts

export const locales = ["pt-BR", "en", "es"] as const;
export type LocaleCode = (typeof locales)[number];
export const defaultLocale: LocaleCode = "en";

export interface LocaleMeta {
  readonly code: LocaleCode;
  readonly flag: string;      // emoji bandeira
  readonly nativeName: string; // nome na própria língua
  readonly dir: "ltr" | "rtl";
}

export const localeMeta: Record<LocaleCode, LocaleMeta> = {
  "pt-BR": { code: "pt-BR", flag: "🇧🇷", nativeName: "Português", dir: "ltr" },
  en:      { code: "en",    flag: "🇺🇸", nativeName: "English",   dir: "ltr" },
  es:      { code: "es",    flag: "🇪🇸", nativeName: "Español",   dir: "ltr" },
};
```

---

## Dictionary Namespace Contracts

Cada namespace é um arquivo JSON com chaves aninhadas (dot-notation no `next-intl`).  
**Regra**: Toda chave presente em um locale DEVE existir em TODOS os outros locales do mesmo namespace.  
**Fallback**: Se uma chave não existir, `next-intl` usará o valor do `defaultLocale` (`en`) e emitirá warning em dev.

### Namespace: `common`

```json
{
  "nav": {
    "services": "Serviços",
    "portfolio": "Portfólio",
    "contact": "Contato",
    "admin": "Admin"
  },
  "cta": {
    "primary": "Fale conosco 24/7",
    "exploreSolutions": "Explorar Soluções",
    "viewPortfolio": "Conhecer Portfólio"
  },
  "footer": {
    "institutional": "Institucional",
    "contact": "Contato",
    "social": "Redes sociais",
    "description": "Soluções de IA para operações digitais com foco em clareza, previsibilidade e escala.",
    "copyright": "© {year} Interasis AI. Todos os direitos reservados.",
    "about": "Sobre",
    "privacy": "Política de Privacidade",
    "terms": "Termos"
  },
  "brand": {
    "name": "Interasis AI",
    "homepageAriaLabel": "Interasis AI - Página inicial",
    "coverAlt": "Interasis AI — Ilustração de cabeça humana estilizada em circuitos."
  },
  "theme": {
    "light": "Ativar tema claro",
    "dark": "Ativar tema escuro"
  },
  "menu": {
    "open": "Abrir menu",
    "close": "Fechar menu",
    "mainNav": "Navegação principal",
    "mobileNav": "Navegação mobile"
  }
}
```

### Namespace: `home`

```json
{
  "metadata": {
    "title": "Interasis AI | Inteligência Artificial e Engenharia de Software sob Medida",
    "description": "Automatize processos, escale operações e resolva gargalos com soluções em nuvem e agentes de IA integrados ao seu negócio."
  },
  "hero": {
    "heading1": "Inteligência Artificial",
    "heading2": "e Engenharia de Software sob Medida.",
    "subtitle": "Automatize processos, escale operações e resolva gargalos complexos com soluções em nuvem e agentes de IA integrados ao seu negócio."
  },
  "services": {
    "heading": "Proposta de Valor",
    "subtitle": "Unimos engenharia moderna e inteligência artificial aplicada para entregar soluções que vão além do discurso — com resultados mensuráveis.",
    "items": {
      "engineering": {
        "title": "Engenharia de Software",
        "description": "Arquitetura Cloud, Next.js e NestJS para produtos escaláveis e confiáveis."
      },
      "ai": {
        "title": "Integração de IA",
        "description": "Agentes autônomos, LLMs e visão computacional conectados ao seu fluxo de negócio."
      },
      "automation": {
        "title": "Automação de Processos",
        "description": "Redução de custos operacionais com workflows inteligentes e orientados por dados."
      }
    }
  },
  "portfolio": {
    "heading": "Portfólio",
    "subtitle": "Cases e demonstrações de projetos de IA e engenharia de software da Interasis AI."
  }
}
```

### Namespace: `chat`

```json
{
  "openChat": "Abrir chat",
  "closeChat": "Fechar chat",
  "assistantName": "Interasis AI",
  "placeholder": "Digite sua mensagem...",
  "retry": "Tentar novamente",
  "recording": {
    "start": "Gravar mensagem de voz",
    "stop": "Parar gravação",
    "timerLabel": "Tempo de gravação"
  },
  "send": "Enviar mensagem",
  "typing": "IA está digitando",
  "fallbackReply": "Recebemos sua mensagem e já estamos processando.",
  "errors": {
    "audioOptimization": "Não foi possível otimizar seu áudio. Grave novamente para continuar.",
    "tenantMissing": "Configuração do tenant ausente. Contate o administrador."
  }
}
```

### Namespace: `about`

```json
{
  "metadata": {
    "title": "Sobre | Interasis AI",
    "description": "Conheça a Interasis AI — inteligência artificial e engenharia de software sob medida."
  },
  "title": "Sobre a Interasis AI",
  "summary": "...",
  "sections": {
    "whoWeAre": {
      "heading": "Quem somos",
      "content": "..."
    },
    "howWeWork": {
      "heading": "Como atuamos",
      "content": "..."
    },
    "commitment": {
      "heading": "Compromisso",
      "content": "..."
    }
  },
  "updatedAt": "Atualizado em"
}
```

### Namespace: `admin`

```json
{
  "metadata": {
    "dashboardTitle": "Painel Administrador | Interasis AI",
    "dashboardDescription": "Gerenciamento administrativo da Interasis AI."
  },
  "dashboard": {
    "heading": "Painel Administrador",
    "subtitle": "Gerencie a base de conhecimento e os canais de atendimento."
  },
  "login": {
    "heading": "Painel Administrador",
    "subtitle": "Entre para gerenciar conhecimento e conexões.",
    "username": "Usuário",
    "password": "Senha",
    "submit": "Entrar",
    "submitting": "Verificando...",
    "errors": {
      "unavailable": "Autenticação administrativa indisponível.",
      "invalidCredentials": "Usuário ou senha inválidos.",
      "generic": "Não foi possível acessar o painel. Tente novamente."
    }
  },
  "navigation": {
    "heading": "Administração",
    "dashboard": "Painel",
    "whatsapp": "WhatsApp",
    "tenants": "Tenants"
  },
  "tenants": {
    "heading": "Tenants",
    "newTenant": "Novo tenant",
    "lookupById": "Consultar por ID",
    "editTitle": "Editar tenant",
    "newTitle": "Novo tenant",
    "form": {
      "tenantId": "ID do tenant",
      "tenantName": "Nome do tenant",
      "googleCalendarId": "ID do Google Calendar",
      "submit": "Cadastrar tenant",
      "submitEdit": "Salvar alterações",
      "submitting": "Cadastrando",
      "submittingEdit": "Salvando",
      "cancel": "Cancelar"
    },
    "details": {
      "notInformed": "Não informado",
      "tenantDeleted": "Tenant excluído",
      "edit": "Editar",
      "delete": "Excluir",
      "labels": {
        "id": "ID",
        "googleCalendar": "Google Calendar",
        "createdAt": "Criado em",
        "updatedAt": "Atualizado em",
        "deletedAt": "Excluído em"
      }
    },
    "deleteDialog": {
      "title": "Excluir tenant?",
      "description": "Esta ação não poderá ser desfeita.",
      "cancel": "Cancelar",
      "confirm": "Excluir",
      "confirming": "Excluindo"
    },
    "lookup": {
      "tenantId": "ID do tenant",
      "search": "Buscar tenant",
      "searching": "Buscando"
    },
    "messages": {
      "created": "Tenant cadastrado com sucesso",
      "updated": "Tenant atualizado com sucesso",
      "deleted": "Tenant excluído com sucesso"
    }
  },
  "whatsapp": {
    "form": {
      "tenantId": "Tenant ID",
      "instanceName": "Nome da instância",
      "submit": "Cadastrar e gerar QR Code",
      "reconnect": "Reconectar / Ver QR Code",
      "submitting": "Solicitando QR Code."
    },
    "qrcode": {
      "title": "Instância {name}",
      "heading": "Conectar WhatsApp",
      "generating": "Gerando QR Code...",
      "error": "Não foi possível exibir este QR Code.",
      "retry": "Tentar novamente",
      "steps": {
        "step1": "Abra o WhatsApp no celular do cliente.",
        "step2": "Vá em Aparelhos Conectados > Conectar um aparelho.",
        "step3": "Aponte a câmera para a tela."
      },
      "back": "Voltar",
      "done": "Concluído / Fechar"
    }
  },
  "ingest": {
    "tenantId": "Tenant ID",
    "contentLabel": "Regras de Negócio / Texto Institucional",
    "placeholder": "Cole aqui o texto institucional...",
    "submitting": "Enviando para vetorização...",
    "submit": "Salvar e Vetorizar Base de Conhecimento"
  },
  "dialog": {
    "close": "Fechar"
  }
}
```

### Namespace: `validation`

```json
{
  "userRequired": "O usuário é obrigatório.",
  "passwordRequired": "A senha é obrigatória.",
  "tenantIdRequired": "O Tenant ID é obrigatório.",
  "instanceNameRequired": "O nome da instância é obrigatório.",
  "tenantNameRequired": "O nome do tenant é obrigatório.",
  "googleCalendarIdRequired": "O ID do Google Calendar é obrigatório.",
  "textRequired": "O conteúdo do texto é obrigatório.",
  "textMaxLength": "O texto excede o limite máximo de 100.000 caracteres.",
  "audio": {
    "readFailure": "Falha ao ler áudio para otimização.",
    "invalidFactor": "Fator de otimização inválido.",
    "empty": "Não foi possível otimizar um áudio vazio.",
    "unsupported": "Seu navegador não suporta otimização de áudio.",
    "durationFailure": "Não foi possível reduzir a duração do áudio gravado."
  }
}
```

---

## Contract Enforcement

1. **TypeScript**: Um tipo `NamespaceKey` deve ser derivado do union de todos os namespaces.
2. **Build-time check**: Script `check-i18n.ts` que itera sobre todos os namespaces e verifica que toda chave existe em todos os 3 locales.
3. **CI gate**: `npm run check-i18n` deve passar no CI antes do merge.
4. **ESLint rule** (opcional): Plugin `eslint-plugin-i18next` para detectar chaves não traduzidas em JSX.

---

## LanguageSwitcher Component Contract

```typescript
// Props interface (não recebe props — é autossuficiente)
// O componente lê o locale atual via useLocale() e a lista via config

interface LanguageSwitcherProps {
  // Intencionalmente vazio — componente auto-contido
  // Usa next-intl hooks internamente
}

// Visual contract:
// - Desktop: dropdown horizontal alinhado à direita, entre ThemeToggle e primary CTA
// - Mobile: item de lista dentro do menu mobile com bandeiras inline
// - Dropdown: glassmorphism com backdrop-blur, framer-motion AnimatePresence
// - Estado ativo: destaque com cor primária (glow sutil)
// - Hover: scale 1.05 max, transição ease-out

// Comportamento:
// - Ao selecionar: navigate para mesma pathname no novo locale
// - Cookie NEXT_LOCALE atualizado automaticamente pelo middleware do next-intl
// - Fecha dropdown automaticamente após seleção (mobile: fecha menu mobile também)
```
