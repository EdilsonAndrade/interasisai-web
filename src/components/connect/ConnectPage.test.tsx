import { render, screen } from "@testing-library/react";

jest.mock("next-intl", () => ({
  useLocale: () => "pt-BR",
}));

import { ChatProvider } from "@/context/ChatContext";
import ConnectPage from "./ConnectPage";
import type { ConnectPageContent } from "./types";

const content: ConnectPageContent = {
  metadata: {
    title: "InterasisAI Connect — Título",
    description: "Descrição de meta.",
    breadcrumbHomeLabel: "Início",
  },
  eyebrow: "A diferença aparece na primeira mensagem",
  title: (
    <>
      Um chatbot <em className="not-italic text-brand-primary">oferece opções.</em> O
      InterasisAI Connect{" "}
      <em className="not-italic text-brand-primary">já sabe a resposta.</em>
    </>
  ),
  lead: "Parágrafo de abertura explicando o contraste.",
  comparisonLabels: { common: "Chatbot comum", connect: "InterasisAI Connect" },
  comparisonBadges: { common: "Hoje", connect: "Ao vivo" },
  verticalDemo: { eyebrow: "Quer ver funcionando de verdade?", buttonLabel: "Clique aqui e experimente agora" },
  architecture: {
    title: "Ele leu tudo sobre o negócio",
    description: "Explicação leiga da arquitetura.",
    analogy: "Analogia do funcionário novo.",
    highlight: "Mudou um preço? Você troca o documento.",
  },
  comparisonTable: {
    title: "Onde está a diferença, na prática",
    rows: [{ label: "Como pergunta", common: "Menu", connect: "Direto" }],
  },
  steps: {
    title: "Quatro passos até estar no ar",
    items: [
      { title: "Conversa inicial", description: "Descrição do passo 1." },
      { title: "Montagem", description: "Descrição do passo 2." },
    ],
  },
  cta: {
    title: "Quer ver isso funcionando no seu negócio?",
    description: "Teste o assistente ao vivo agora mesmo.",
    buttonLabel: "Testar Assistente ao Vivo",
  },
  verticals: [],
  integrations: {
    title: "Vai muito além do agendamento",
    description: "Descrição acessível das categorias integráveis.",
    closedScope: "Explicação do projeto de escopo fechado.",
    categories: [
      { id: "crm", label: "CRM", description: "Sincroniza contatos e oportunidades." },
      { id: "database", label: "Base de dados", description: "Consulta e atualiza dados existentes." },
      { id: "api", label: "API", description: "Troca dados em tempo real." },
      { id: "mcp", label: "MCP", description: "Conecta com ferramentas via padrão MCP." },
      { id: "hr", label: "Sistemas de RH", description: "Consulta informações do colaborador." },
      { id: "others", label: "Outras integrações", description: "Avaliadas caso a caso." },
    ],
    diagram: {
      nucleusLabel: "InterasisAI Connect — chat e agentes",
      ariaLabel: "Diagrama: núcleo conectado a CRM, base de dados, API, MCP e sistemas de RH",
      caption: "O núcleo se conecta a cada ambiente do negócio.",
    },
  },
};

function renderConnectPage() {
  return render(
    <ChatProvider>
      <ConnectPage content={content} ctaButtonLabel={content.cta.buttonLabel} />
    </ChatProvider>,
  );
}

describe("ConnectPage", () => {
  it("renders the hero (eyebrow, h1 title, lead)", () => {
    renderConnectPage();

    const expectedHeadingName =
      "Um chatbot oferece opções. O InterasisAI Connect já sabe a resposta.";
    expect(screen.getByText(content.eyebrow)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: expectedHeadingName }),
    ).toBeInTheDocument();
    expect(screen.getByText(content.lead)).toBeInTheDocument();
  });

  it("highlights the emphasized fragments of the h1 title, like the reference material", () => {
    renderConnectPage();

    const heading = screen.getByRole("heading", { level: 1 });
    const emphasized = heading.querySelectorAll("em");
    expect(emphasized).toHaveLength(2);
    expect(emphasized[0]).toHaveTextContent("oferece opções.");
    expect(emphasized[1]).toHaveTextContent("já sabe a resposta.");
  });

  it("renders the architecture section, including the highlighted closing line", () => {
    renderConnectPage();

    expect(
      screen.getByRole("heading", { level: 2, name: content.architecture.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(content.architecture.description)).toBeInTheDocument();
    expect(screen.getByText(content.architecture.analogy)).toBeInTheDocument();
    expect(screen.getByText(content.architecture.highlight)).toBeInTheDocument();
  });

  it("renders the integrations section (title, closed-scope text and all category labels)", () => {
    renderConnectPage();

    expect(
      screen.getByRole("heading", { level: 2, name: content.integrations.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(content.integrations.description)).toBeInTheDocument();
    expect(screen.getByText(content.integrations.closedScope)).toBeInTheDocument();
    for (const category of content.integrations.categories) {
      expect(screen.getAllByText(category.label).length).toBeGreaterThan(0);
    }
  });

  it("renders the integration diagram with its aria-label inside the integrations section", () => {
    renderConnectPage();

    expect(
      screen.getByRole("img", { name: content.integrations.diagram.ariaLabel }),
    ).toBeInTheDocument();
  });

  it("renders the comparison table rows", () => {
    renderConnectPage();

    expect(
      screen.getByRole("heading", { level: 2, name: content.comparisonTable.title }),
    ).toBeInTheDocument();
    expect(screen.getByText("Como pergunta")).toBeInTheDocument();
    expect(screen.getByText("Menu")).toBeInTheDocument();
    expect(screen.getByText("Direto")).toBeInTheDocument();
  });

  it("renders the process steps", () => {
    renderConnectPage();

    expect(screen.getByRole("heading", { level: 2, name: content.steps.title })).toBeInTheDocument();
    expect(screen.getByText("Conversa inicial")).toBeInTheDocument();
    expect(screen.getByText("Montagem")).toBeInTheDocument();
  });

  it("renders the CTA block with the chat-opening button", () => {
    renderConnectPage();

    expect(screen.getByText(content.cta.title)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: content.cta.buttonLabel })).toBeInTheDocument();
  });
});
