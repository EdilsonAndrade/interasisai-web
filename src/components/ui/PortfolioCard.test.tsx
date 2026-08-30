import { render, screen } from "@testing-library/react";
import { Bot } from "lucide-react";

import PortfolioCard from "./PortfolioCard";

const baseProps = {
  title: "InterasisAI Connect",
  category: "IA Conversacional",
  description: "Descrição técnica do produto.",
  highlights: ["Destaque 1"],
  tags: ["RAG"],
  status: "Omnichannel Ativo",
  Icon: Bot,
  actionText: "Testar Assistente ao Vivo",
};

describe("PortfolioCard", () => {
  it("renders the impact text visually distinct from the technical description", () => {
    render(
      <PortfolioCard
        {...baseProps}
        impactText="Não é um chatbot. É a arquitetura que garante que seu cliente nunca fale com um menu."
      />,
    );

    const impactText = screen.getByTestId("portfolio-impact-text");
    expect(impactText).toHaveTextContent(
      "Não é um chatbot. É a arquitetura que garante que seu cliente nunca fale com um menu.",
    );
    expect(impactText).not.toHaveTextContent(baseProps.description);
  });

  it("renders normally without impactText (backwards compatibility with other cards)", () => {
    render(<PortfolioCard {...baseProps} />);

    expect(screen.queryByTestId("portfolio-impact-text")).not.toBeInTheDocument();
    expect(screen.getByText(baseProps.description)).toBeInTheDocument();
  });

  it("renders all 5 highlights when the chatAssistant card provides them", () => {
    const highlights = [
      "Destaque 1",
      "Destaque 2",
      "Destaque 3",
      "Destaque 4",
      "Integração com CRM, base de dados e APIs via projeto de escopo fechado",
    ];

    render(<PortfolioCard {...baseProps} highlights={highlights} />);

    for (const highlight of highlights) {
      expect(screen.getByText(highlight)).toBeInTheDocument();
    }
  });

  it("does not render the 'Saiba mais' link when learnMoreLabel/learnMoreHref are missing", () => {
    render(<PortfolioCard {...baseProps} />);

    expect(screen.queryByRole("link", { name: /saiba mais/i })).not.toBeInTheDocument();
  });

  it("renders the 'Saiba mais' link pointing to learnMoreHref when both props are provided", () => {
    render(
      <PortfolioCard
        {...baseProps}
        learnMoreLabel="Saiba mais"
        learnMoreHref="/pt-BR/interasisai-connect"
      />,
    );

    const link = screen.getByRole("link", { name: "Saiba mais" });
    expect(link).toHaveAttribute("href", "/pt-BR/interasisai-connect");
  });
});
