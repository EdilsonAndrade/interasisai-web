import { render, screen } from "@testing-library/react";

import Home from "./page";

describe("Home", () => {
  it("renders the home content using semantic structure and key calls to action", () => {
    render(<Home />);

    expect(screen.getByTestId("landing-page")).toHaveClass("bg-deep");
    expect(screen.getByTestId("hero-block")).toBeInTheDocument();
    expect(screen.getByTestId("portfolio-block")).toBeInTheDocument();
    expect(screen.getByTestId("contact-block")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: /Estrutura global pronta para navegar/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Fale com a IA/i })).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: /Portifolio de Solucoes/i })).toBeInTheDocument();
    expect(screen.getByText(/Automacao de atendimento com IA/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Vamos estruturar a sua casca global de produto/i })).toBeInTheDocument();
  });
});
