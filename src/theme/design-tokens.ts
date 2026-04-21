import type { CSSProperties } from "react";

const hexToRgbChannels = (hex: string) => {
  const normalized = hex.replace("#", "");
  const expanded = normalized.length === 3
    ? normalized
        .split("")
        .map((channel) => `${channel}${channel}`)
        .join("")
    : normalized;

  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);

  return `${red} ${green} ${blue}`;
};

const colorVariable = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

type ThemeStyle = CSSProperties & Record<`--${string}`, string>;

type TokenCorrespondenceEntry = {
  sourceTokenName: string;
  projectTokenName: string;
  semanticRole: string;
  coverageStatus: "mapped" | "gap" | "out-of-scope";
  notes: string;
};

export const designTokens = {
  brand: {
    primary: "#1D6FE8",
    primaryHover: "#1557B7",
    primarySoft: "#EAF3FF",
    secondary: "#26214F",
    secondarySoft: "#312A66",
  },
  accent: {
    campaign: "#2A225A",
  },
  surface: {
    page: "#0B1020",
    base: "#121A2D",
    subtle: "#18233A",
    heroStart: "#0A1120",
    heroEnd: "#151F39",
  },
  text: {
    strong: "#F8FAFC",
    body: "#D7DFED",
    inverse: "#FFFFFF",
  },
  border: {
    subtle: "#2A3550",
  },
  shape: {
    card: "1rem",
    button: "0.75rem",
    pill: "999px",
  },
  depth: {
    card: "0 16px 40px rgba(15, 23, 42, 0.08)",
    floating: "0 24px 60px rgba(15, 23, 42, 0.16)",
  },
} as const;

export const designTokenGovernance = {
  sourceSkillPath: ".ai/skills/deisgn-token/SKILL.MD",
  referenceImagePath: ".ai/skills/deisgn-token/examples/example-page.webp",
  namingMismatch: {
    expected: "design-token",
    actual: "deisgn-token",
    documented: true,
    decision: "A pasta permanece intacta nesta feature; o desvio fica apenas documentado.",
  },
} as const;

export const tokenCorrespondence: TokenCorrespondenceEntry[] = [
  {
    sourceTokenName: "brand.primary",
    projectTokenName: "brand.primary",
    semanticRole: "CTA principal e realces institucionais",
    coverageStatus: "mapped",
    notes: "Base azul viva da interface e das ações primárias.",
  },
  {
    sourceTokenName: "brand.secondary",
    projectTokenName: "brand.secondary",
    semanticRole: "Apoio institucional escuro",
    coverageStatus: "mapped",
    notes: "Usado em contrastes escuros e elementos de apoio.",
  },
  {
    sourceTokenName: "surface.page",
    projectTokenName: "surface.page",
    semanticRole: "Plano de fundo principal",
    coverageStatus: "mapped",
    notes: "Mantém leitura clara fora do hero.",
  },
  {
    sourceTokenName: "surface.heroStart",
    projectTokenName: "surface.hero.start",
    semanticRole: "Início do gradiente do hero",
    coverageStatus: "mapped",
    notes: "Controla a profundidade azul escura do hero.",
  },
  {
    sourceTokenName: "surface.heroEnd",
    projectTokenName: "surface.hero.end",
    semanticRole: "Fim do gradiente do hero",
    coverageStatus: "mapped",
    notes: "Entrega o azul vibrante do hero.",
  },
  {
    sourceTokenName: "text.strong",
    projectTokenName: "text.strong",
    semanticRole: "Títulos e conteúdo de alta ênfase",
    coverageStatus: "mapped",
    notes: "Evita preto puro e mantém contraste alto.",
  },
  {
    sourceTokenName: "border.subtle",
    projectTokenName: "border.subtle",
    semanticRole: "Separadores e contornos leves",
    coverageStatus: "mapped",
    notes: "Mantém a interface clara e organizada.",
  },
  {
    sourceTokenName: "accent.campaign",
    projectTokenName: "accent.campaign",
    semanticRole: "Apoio visual secundário",
    coverageStatus: "mapped",
    notes: "Roxo restrito a badges e detalhes de campanha.",
  },
];

export const rootThemeStyle: ThemeStyle = {
  "--color-brand-primary": hexToRgbChannels(designTokens.brand.primary),
  "--color-brand-primary-hover": hexToRgbChannels(designTokens.brand.primaryHover),
  "--color-brand-primary-soft": hexToRgbChannels(designTokens.brand.primarySoft),
  "--color-brand-secondary": hexToRgbChannels(designTokens.brand.secondary),
  "--color-brand-secondary-soft": hexToRgbChannels(designTokens.brand.secondarySoft),
  "--color-accent-campaign": hexToRgbChannels(designTokens.accent.campaign),
  "--color-surface-page": hexToRgbChannels(designTokens.surface.page),
  "--color-surface-base": hexToRgbChannels(designTokens.surface.base),
  "--color-surface-subtle": hexToRgbChannels(designTokens.surface.subtle),
  "--color-surface-hero-start": hexToRgbChannels(designTokens.surface.heroStart),
  "--color-surface-hero-end": hexToRgbChannels(designTokens.surface.heroEnd),
  "--color-text-strong": hexToRgbChannels(designTokens.text.strong),
  "--color-text-body": hexToRgbChannels(designTokens.text.body),
  "--color-text-inverse": hexToRgbChannels(designTokens.text.inverse),
  "--color-border-subtle": hexToRgbChannels(designTokens.border.subtle),
  "--radius-card": designTokens.shape.card,
  "--radius-button": designTokens.shape.button,
  "--radius-pill": designTokens.shape.pill,
  "--shadow-card": designTokens.depth.card,
  "--shadow-floating": designTokens.depth.floating,
};

export const tailwindThemeExtension = {
  colors: {
    deep: colorVariable("--color-surface-page"),
    main: colorVariable("--color-text-strong"),
    brand: {
      primary: colorVariable("--color-brand-primary"),
      "primary-hover": colorVariable("--color-brand-primary-hover"),
      "primary-soft": colorVariable("--color-brand-primary-soft"),
      secondary: colorVariable("--color-brand-secondary"),
      "secondary-soft": colorVariable("--color-brand-secondary-soft"),
    },
    accent: {
      campaign: colorVariable("--color-accent-campaign"),
    },
    surface: {
      page: colorVariable("--color-surface-page"),
      base: colorVariable("--color-surface-base"),
      subtle: colorVariable("--color-surface-subtle"),
      hero: {
        start: colorVariable("--color-surface-hero-start"),
        end: colorVariable("--color-surface-hero-end"),
      },
    },
    text: {
      strong: colorVariable("--color-text-strong"),
      body: colorVariable("--color-text-body"),
      inverse: colorVariable("--color-text-inverse"),
    },
    border: {
      subtle: colorVariable("--color-border-subtle"),
    },
  },
  borderRadius: {
    card: designTokens.shape.card,
    button: designTokens.shape.button,
    pill: designTokens.shape.pill,
  },
  boxShadow: {
    card: designTokens.depth.card,
    floating: designTokens.depth.floating,
  },
  backgroundImage: {
    "gradient-hero": "var(--gradient-hero)",
    "gradient-panel": "var(--gradient-panel)",
  },
  fontFamily: {
    "space-grotesk": ["var(--font-space-grotesk)", "ui-sans-serif", "system-ui", "sans-serif"] as string[],
  },
} as const;
