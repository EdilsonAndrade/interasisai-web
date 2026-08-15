import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/hooks/useLanguageSwitch", () => ({
  useLanguageSwitch: () => ({
    currentLocale: "pt-BR",
    switchTo: jest.fn(),
  }),
}));

jest.mock("next-intl", () => ({
  useLocale: () => "pt-BR",
  useTranslations: () => (key: string) => key,
}));

import Header from "./Header";

jest.mock("@/context/ChatContext", () => ({
  useChat: () => ({
    isOpen: false,
    open: jest.fn(),
    close: jest.fn(),
    toggle: jest.fn(),
  }),
}));

describe("Header", () => {
  it("renders brand logo with single accessible name, navigation and primary CTA", () => {
    render(<Header />);

    expect(screen.getByRole("banner")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "nav.services" })).toHaveAttribute("href", "/pt-BR#servicos");
    expect(screen.getByRole("link", { name: "nav.portfolio" })).toHaveAttribute("href", "/pt-BR#portfolio");
    expect(screen.getByRole("link", { name: "nav.contact" })).toHaveAttribute("href", "/pt-BR#contato");
    expect(screen.getByRole("button", { name: "cta.primary" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "theme.light" })[0]).toBeInTheDocument();
  });

  it("opens and closes the mobile menu with local state", () => {
    render(<Header />);

    const menuButton = screen.getByRole("button", { name: "menu.open" });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(menuButton);

    expect(screen.getByRole("navigation", { name: "menu.mobileNav" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "menu.close" })).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(screen.getByRole("button", { name: "menu.close" }));

    expect(screen.queryByRole("navigation", { name: "menu.mobileNav" })).not.toBeInTheDocument();
  });
});
