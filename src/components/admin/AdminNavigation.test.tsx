import { fireEvent, render, screen } from "@testing-library/react";
import { AdminNavigation } from "./AdminNavigation";

let mockPathname = "/admin/tenants";

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("AdminNavigation", () => {
  beforeEach(() => {
    mockPathname = "/admin/tenants";
  });

  it("renders authorized admin destinations and active state", () => {
    render(<AdminNavigation />);

    expect(screen.getByRole("navigation", { name: "Administração" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tenants" })).toHaveAttribute(
      "href",
      "/admin/tenants",
    );
    expect(screen.getByRole("link", { name: "Tenants" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "WhatsApp" })).toHaveAttribute(
      "href",
      "/admin/whatsapp",
    );
    expect(screen.getByRole("link", { name: "Configurações Globais" })).toHaveAttribute(
      "href",
      "/admin/global-settings",
    );
  });
});

describe("AdminNavigation — Painel menu (EDI-71)", () => {
  beforeEach(() => {
    mockPathname = "/admin/tenants";
  });

  it("hides the submenu until 'Painel' is clicked, then shows both destinations", () => {
    render(<AdminNavigation />);

    expect(screen.queryByRole("menuitem", { name: "Prompts do Sistema" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Painel/ }));

    expect(screen.getByRole("menuitem", { name: "Prompts do Sistema" })).toHaveAttribute(
      "href",
      "/admin/system-prompts",
    );
    expect(screen.getByRole("menuitem", { name: "Ingestão Tenant" })).toHaveAttribute(
      "href",
      "/admin",
    );
  });

  it("keeps 'Ingestão Tenant' pointing at the existing /admin route", () => {
    render(<AdminNavigation />);
    fireEvent.click(screen.getByRole("button", { name: /Painel/ }));

    expect(screen.getByRole("menuitem", { name: "Ingestão Tenant" })).toHaveAttribute(
      "href",
      "/admin",
    );
  });

  it("closes the submenu after selecting an item", () => {
    render(<AdminNavigation />);
    fireEvent.click(screen.getByRole("button", { name: /Painel/ }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Prompts do Sistema" }));

    expect(screen.queryByRole("menuitem", { name: "Prompts do Sistema" })).not.toBeInTheDocument();
  });

  it("closes the submenu on Escape", () => {
    render(<AdminNavigation />);
    fireEvent.click(screen.getByRole("button", { name: /Painel/ }));
    expect(screen.getByRole("menuitem", { name: "Ingestão Tenant" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("menuitem", { name: "Ingestão Tenant" })).not.toBeInTheDocument();
  });

  it("marks the Painel trigger as active when on /admin/system-prompts", () => {
    mockPathname = "/admin/system-prompts";
    render(<AdminNavigation />);

    expect(screen.getByRole("button", { name: /Painel/ })).toHaveClass("bg-brand-primary");
  });
});