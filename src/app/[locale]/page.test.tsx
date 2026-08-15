import type { ReactNode } from "react";
import { act, render, screen } from "@testing-library/react";
import Home from "./page";

jest.mock("next-intl/server", () => ({
  getTranslations: jest.fn().mockResolvedValue((key: string) => key),
}));

jest.mock("@/context/ChatContext", () => ({
  useChat: () => ({
    isOpen: false,
    open: jest.fn(),
    close: jest.fn(),
    toggle: jest.fn(),
  }),
}));

jest.mock("@/components/ui/animations/FadeIn", () => ({
  __esModule: true,
  default: ({ children, delay = 0 }: { children: ReactNode; delay?: number }) => (
    <div data-testid="fade-in" data-delay={String(delay)}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/HeroCover", () => ({
  __esModule: true,
  default: () => <div data-testid="hero-cover">HeroCover</div>,
}));

jest.mock("@/components/ui/HeroChatCta", () => ({
  __esModule: true,
  default: () => <button data-testid="hero-chat-cta">CTA</button>,
}));

jest.mock("@/components/ui/PortfolioSection", () => ({
  __esModule: true,
  default: () => <div data-testid="portfolio-section">PortfolioSection</div>,
}));

describe("Home", () => {
  it("renders hero content with heading, CTAs and brand cover", async () => {
    const element = await Home();
    await act(async () => {
      render(element);
    });

    expect(screen.getByTestId("landing-page")).toBeInTheDocument();
    expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    expect(screen.getByText("hero.heading1")).toBeInTheDocument();
    expect(screen.getByText("hero.heading2")).toBeInTheDocument();
    expect(screen.getByText("hero.subtitle")).toBeInTheDocument();

    const primaryCta = screen.getByRole("link", { name: "cta.exploreSolutions" });
    const secondaryCta = screen.getByRole("link", { name: "cta.viewPortfolio" });
    expect(primaryCta).toBeInTheDocument();
    expect(secondaryCta).toBeInTheDocument();
  });

  it("renders services section with three required cards", async () => {
    const element = await Home();
    await act(async () => {
      render(element);
    });

    expect(screen.getByTestId("services-section")).toBeInTheDocument();
    expect(screen.getByTestId("services-grid")).toHaveClass("grid-cols-1", "md:grid-cols-3");
    expect(screen.getAllByTestId("feature-card")).toHaveLength(3);
  });

  it("renders portfolio section and wraps all main blocks with FadeIn", async () => {
    const element = await Home();
    await act(async () => {
      render(element);
    });

    expect(screen.getByTestId("portfolio-section")).toBeInTheDocument();
    const wrappers = screen.getAllByTestId("fade-in");
    expect(wrappers).toHaveLength(3);
  });
});
