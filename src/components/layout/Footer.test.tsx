import { render, screen } from "@testing-library/react";

import Footer from "./Footer";

describe("Footer", () => {
  it("renders institutional links, social links and contact information", () => {
    render(<Footer />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Links institucionais" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sobre" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Politica de Privacidade" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Termos" })).toBeInTheDocument();
    expect(screen.getByText("contato@interasis.ai")).toBeInTheDocument();
    expect(screen.getByText("+55 (11) 4000-0000")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "LinkedIn" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Instagram" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "YouTube" })).toBeInTheDocument();
  });
});
