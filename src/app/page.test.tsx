import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";

import Home, { metadata } from "./page";
import SobrePage from "./sobre/page";
import PoliticaPrivacidadePage from "./politica-de-privacidade/page";
import TermosPage from "./termos/page";

jest.mock("@/components/ui/animations/FadeIn", () => ({
  __esModule: true,
  default: ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => (
    <div data-testid="fade-in" data-delay={String(delay)}>
      {children}
    </div>
  ),
}));

describe("Home", () => {
  it("renders hero content with heading, value proposition, CTAs and brand cover", () => {
    render(<Home />);

    expect(screen.getByTestId("landing-page")).toBeInTheDocument();
    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    expect(screen.getByTestId("hero-grid")).toHaveClass("flex", "flex-col");
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

    const cover = screen.getByRole("img", {
      name: /inteligência que conecta\. tecnologia que transforma\./i,
    });
    expect(cover).toBeInTheDocument();
    expect(screen.getByTestId("hero-cover")).toContainElement(cover);
  });

  it("renders services section with three required cards", () => {
    render(<Home />);

    expect(screen.getByTestId("services-section")).toBeInTheDocument();
    expect(screen.getByTestId("services-grid")).toHaveClass("grid-cols-1", "md:grid-cols-3");

    expect(screen.getByRole("heading", { level: 3, name: /engenharia de software/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: /integração de ia/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: /automação de processos/i })).toBeInTheDocument();

    expect(screen.getAllByTestId("feature-card")).toHaveLength(3);
    expect(document.querySelector("#servicos")).toBeInTheDocument();
    expect(document.querySelector("#portfolio")).toBeInTheDocument();
  });

  it("wraps both main blocks with FadeIn", () => {
    render(<Home />);

    const wrappers = screen.getAllByTestId("fade-in");
    expect(wrappers).toHaveLength(2);
    expect(wrappers[0]).toHaveAttribute("data-delay", "0");
    expect(wrappers[1]).toHaveAttribute("data-delay", "0.1");
  });

  it("exposes Open Graph metadata pointing to brand cover", () => {
    expect(metadata.openGraph?.images).toBeDefined();
    const images = metadata.openGraph?.images as Array<{
      url: string;
      width: number;
      height: number;
      alt: string;
    }>;
    expect(images).toHaveLength(1);
    expect(images[0].url).toBe("/images/interasisai_coverpage.png");
    expect(images[0].width).toBe(1200);
    expect(images[0].height).toBe(630);
    expect(images[0].alt).toMatch(/Interasis AI/i);

    expect(metadata.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("renders legal pages smoke content", () => {
    const { unmount } = render(<SobrePage />);
    expect(screen.getByRole("heading", { level: 1, name: "Sobre a Interasis AI" })).toBeInTheDocument();
    unmount();

    render(<PoliticaPrivacidadePage />);
    expect(screen.getByRole("heading", { level: 1, name: "Política de Privacidade" })).toBeInTheDocument();
    unmount();

    render(<TermosPage />);
    expect(screen.getByRole("heading", { level: 1, name: "Termos de Uso" })).toBeInTheDocument();
  });
});

