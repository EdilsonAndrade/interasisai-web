import { render, screen } from "@testing-library/react";

import Footer from "./Footer";

describe("Footer", () => {
  it("renders brand logo, institutional links, social links and contact information", () => {
    render(<Footer />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByTestId("brand-logo-text")).toHaveTextContent("Interasis AI");
    expect(screen.getByRole("navigation", { name: "Links institucionais" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sobre" })).toHaveAttribute("href", "/sobre");
    expect(screen.getByRole("link", { name: "Política de Privacidade" })).toHaveAttribute("href", "/politica-de-privacidade");
    expect(screen.getByRole("link", { name: "Termos" })).toHaveAttribute("href", "/termos");
    expect(screen.getByRole("link", { name: "contato@interasisai.com.br" })).toHaveAttribute(
      "href",
      "mailto:contato@interasisai.com.br",
    );
    expect(screen.getByRole("link", { name: "+55 (11) 97745-6057" })).toHaveAttribute(
      "href",
      "tel:+5511977456057",
    );

    const linkedIn = screen.getByRole("link", { name: "LinkedIn" });
    expect(linkedIn).toHaveAttribute("href", "https://www.linkedin.com/company/115859702/admin/dashboard/");
    expect(screen.queryByRole("link", { name: "Instagram" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "YouTube" })).not.toBeInTheDocument();
  });

  it("renders legal identification (razão social, CNPJ and location)", () => {
    render(<Footer />);

    expect(screen.getByText(/62\.168\.089\/0001-57/)).toBeInTheDocument();
    expect(screen.getByText(/Piracicaba, SP/)).toBeInTheDocument();
  });
});
