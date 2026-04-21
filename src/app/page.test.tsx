import { render, screen } from "@testing-library/react";

import Home from "./page";

describe("Home", () => {
  it("renders the reference landing page with semantic theme hooks", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: /Sincronize sua operação digital com clareza/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /Agendar diagnóstico/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /Ver arquitetura de entrega/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/Azul institucional como base/i)).toBeInTheDocument();
    expect(screen.getByText(/Roxo restrito a apoio visual/i)).toBeInTheDocument();
    expect(screen.getByText(/Time sênior em IA aplicada/i)).toBeInTheDocument();

    expect(screen.getByTestId("landing-page")).toHaveClass("bg-surface-page");
    expect(screen.getByTestId("hero-section")).toHaveClass("bg-gradient-hero");
    expect(screen.getByTestId("primary-cta")).toHaveClass("bg-brand-primary");
    expect(screen.getByTestId("campaign-badge")).toHaveClass("bg-accent-campaign");
  });
});
