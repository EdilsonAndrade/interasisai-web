import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";

import Home from "./page";

jest.mock("@/components/ui/animations/FadeIn", () => ({
  __esModule: true,
  default: ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => (
    <div data-testid="fade-in" data-delay={String(delay)}>
      {children}
    </div>
  ),
}));

describe("Home", () => {
  it("renders hero content with heading, value proposition and CTAs", () => {
    render(<Home />);

    expect(screen.getByTestId("landing-page")).toBeInTheDocument();
    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /inteligência artificial e engenharia de software sob medida/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/automatize processos, escale operações e resolva gargalos complexos/i),
    ).toBeInTheDocument();

    const primaryCta = screen.getByRole("link", { name: /explorar soluções/i });
    const secondaryCta = screen.getByRole("link", { name: /conhecer portfólio/i });

    expect(primaryCta).toHaveAttribute("href", "#");
    expect(secondaryCta).toHaveAttribute("href", "#");
    expect(primaryCta).toHaveClass("bg-brand-primary");
    expect(secondaryCta).toHaveClass("border");
  });

  it("renders services section with three required cards", () => {
    render(<Home />);

    expect(screen.getByTestId("services-section")).toBeInTheDocument();
    expect(screen.getByTestId("services-grid")).toHaveClass("grid-cols-1", "md:grid-cols-3");

    expect(screen.getByRole("heading", { level: 3, name: /engenharia de software/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: /integração de ia/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: /automação de processos/i })).toBeInTheDocument();

    expect(screen.getAllByTestId("feature-card")).toHaveLength(3);
  });

  it("wraps both main blocks with FadeIn", () => {
    render(<Home />);

    const wrappers = screen.getAllByTestId("fade-in");
    expect(wrappers).toHaveLength(2);
    expect(wrappers[0]).toHaveAttribute("data-delay", "0");
    expect(wrappers[1]).toHaveAttribute("data-delay", "0.1");
  });
});
