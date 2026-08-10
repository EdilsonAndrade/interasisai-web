import { fireEvent, render, screen } from "@testing-library/react";

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

    const brandLinks = screen.getAllByRole("link", { name: "Interasis AI - Página inicial" });
    expect(brandLinks).toHaveLength(1);
    expect(brandLinks[0]).toHaveAttribute("href", "/");

    expect(screen.getByRole("link", { name: "Serviços" })).toHaveAttribute("href", "/#servicos");
    expect(screen.getByRole("link", { name: "Portfólio" })).toHaveAttribute("href", "/#portfolio");
    expect(screen.getAllByRole("link", { name: "Contato" })[0]).toHaveAttribute("href", "/#contato");
    expect(screen.getByRole("button", { name: "Fale conosco 24/7" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Ativar tema claro" })[0]).toBeInTheDocument();
  });

  it("opens and closes the mobile menu with local state", () => {
    render(<Header />);

    const menuButton = screen.getByRole("button", { name: "Abrir menu" });
    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(menuButton);

    expect(screen.getByRole("navigation", { name: "Navegacao mobile" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fechar menu" })).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(screen.getByRole("button", { name: "Fechar menu" }));

    expect(screen.queryByRole("navigation", { name: "Navegacao mobile" })).not.toBeInTheDocument();
  });
});
