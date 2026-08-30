import { render, screen, within } from "@testing-library/react";

import ConnectIntegrationDiagram from "./ConnectIntegrationDiagram";
import type { IntegrationCategory } from "./types";

const categories: IntegrationCategory[] = [
  { id: "crm", label: "CRM", description: "Sincroniza contatos e oportunidades." },
  { id: "database", label: "Base de dados", description: "Consulta e atualiza dados existentes." },
  { id: "api", label: "API", description: "Troca dados em tempo real." },
  { id: "mcp", label: "MCP", description: "Conecta com ferramentas via padrão MCP." },
  { id: "hr", label: "Sistemas de RH", description: "Consulta informações do colaborador." },
  { id: "others", label: "Outras integrações", description: "Avaliadas caso a caso." },
];

const nucleusLabel = "InterasisAI Connect — chat e agentes";
const ariaLabel = "Diagrama: núcleo conectado a CRM, base de dados, API, MCP e sistemas de RH";
const caption = "O núcleo se conecta a cada ambiente do negócio.";

beforeAll(() => {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: true,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }));
});

function renderDiagram() {
  return render(
    <ConnectIntegrationDiagram
      categories={categories}
      nucleusLabel={nucleusLabel}
      ariaLabel={ariaLabel}
      caption={caption}
    />,
  );
}

describe("ConnectIntegrationDiagram", () => {
  it("exposes role=img with the translated aria-label", () => {
    renderDiagram();

    expect(screen.getByRole("img", { name: ariaLabel })).toBeInTheDocument();
  });

  it("renders every category label visibly", () => {
    renderDiagram();

    for (const category of categories) {
      expect(screen.getAllByText(category.label).length).toBeGreaterThan(0);
    }
  });

  it("keeps an sr-only list with the nucleus label and all category labels", () => {
    renderDiagram();

    const diagram = screen.getByRole("img", { name: ariaLabel });
    const list = diagram.querySelector("ul.sr-only");
    expect(list).not.toBeNull();

    const items = within(list as HTMLElement).getAllByRole("listitem");
    expect(items).toHaveLength(categories.length + 1);
    expect(items[0]).toHaveTextContent(nucleusLabel);
    categories.forEach((category, index) => {
      expect(items[index + 1]).toHaveTextContent(category.label);
    });
  });

  it("renders the visible caption", () => {
    renderDiagram();

    expect(screen.getByText(caption)).toBeInTheDocument();
  });

  it("falls back to a static diagram (no animation) when prefers-reduced-motion is reduced", () => {
    renderDiagram();

    const diagram = screen.getByRole("img", { name: ariaLabel });
    const svg = diagram.querySelector("svg");
    const paths = svg?.querySelectorAll("path[marker-end]");
    expect(paths).toHaveLength(categories.length);
    paths?.forEach((path) => {
      expect(path).not.toHaveAttribute("stroke-dasharray");
    });
    for (const category of categories) {
      expect(screen.getAllByText(category.label).length).toBeGreaterThan(0);
    }
  });
});
