import { render, screen } from "@testing-library/react";
import { AdminNavigation } from "./AdminNavigation";

jest.mock("next/navigation", () => ({
  usePathname: () => "/admin/tenants",
}));

describe("AdminNavigation", () => {
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
  });
});