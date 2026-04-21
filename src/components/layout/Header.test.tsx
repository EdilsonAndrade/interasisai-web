import { fireEvent, render, screen } from "@testing-library/react";

import Header from "./Header";

describe("Header", () => {
  it("renders brand, desktop navigation and primary CTA", () => {
    render(<Header />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Interasis AI" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Servicos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Portfolio" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Contato" })[0]).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Fale com a IA" })[0]).toBeInTheDocument();
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
