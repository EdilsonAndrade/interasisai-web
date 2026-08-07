export type InstitutionalSection = {
  heading: string;
  body: string;
};

export type InstitutionalPageContent = {
  slug: "sobre" | "politica-de-privacidade" | "termos";
  title: string;
  summary: string;
  updatedAt: string;
  sections: InstitutionalSection[];
};

export const institutionalPages: Record<InstitutionalPageContent["slug"], InstitutionalPageContent> = {
  sobre: {
    slug: "sobre",
    title: "Sobre a Interasis AI",
    summary: "Transformamos operações digitais com clareza, previsibilidade e escala por meio de IA aplicada.",
    updatedAt: "2026-08-07",
    sections: [
      {
        heading: "Quem somos",
        body:
          "A Interasis AI é uma empresa focada em engenharia de software e inteligência artificial para resolver gargalos operacionais reais.",
      },
      {
        heading: "Como atuamos",
        body:
          "Combinamos tecnologia em nuvem, automação e agentes inteligentes para elevar eficiência, reduzir retrabalho e dar visibilidade para decisões.",
      },
      {
        heading: "Compromisso",
        body:
          "Nosso compromisso é entregar soluções confiáveis, com comunicação objetiva e impacto mensurável no dia a dia de operações digitais.",
      },
    ],
  },
  "politica-de-privacidade": {
    slug: "politica-de-privacidade",
    title: "Política de Privacidade",
    summary: "Explicamos como coletamos, utilizamos e protegemos informações relacionadas ao uso do site.",
    updatedAt: "2026-08-07",
    sections: [
      {
        heading: "Dados coletados",
        body:
          "Podemos coletar dados fornecidos por você em formulários e interações de contato, sempre com finalidade relacionada ao atendimento e evolução do serviço.",
      },
      {
        heading: "Uso das informações",
        body:
          "As informações são utilizadas para comunicação, melhoria de experiência e evolução de soluções, respeitando princípios de necessidade e proporcionalidade.",
      },
      {
        heading: "Segurança",
        body:
          "Adotamos medidas técnicas e organizacionais para reduzir riscos de acesso não autorizado, alteração ou uso indevido das informações tratadas.",
      },
    ],
  },
  termos: {
    slug: "termos",
    title: "Termos de Uso",
    summary: "Estes termos definem as condições gerais de acesso e uso dos conteúdos e serviços da Interasis AI.",
    updatedAt: "2026-08-07",
    sections: [
      {
        heading: "Aceitação",
        body:
          "Ao utilizar este site, você concorda com estes termos e com a legislação aplicável, comprometendo-se a usar os recursos de forma lícita e responsável.",
      },
      {
        heading: "Limites de uso",
        body:
          "Não é permitido utilizar o site para atividades ilícitas, tentativas de exploração de vulnerabilidades ou qualquer conduta que prejudique terceiros.",
      },
      {
        heading: "Atualizações",
        body:
          "Podemos atualizar estes termos para refletir melhorias do serviço, requisitos legais ou mudanças operacionais relevantes.",
      },
    ],
  },
};
