import { fireEvent, render, screen } from "@testing-library/react";
import { TenantSnippet } from "./TenantSnippet";

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

describe("TenantSnippet", () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://interasisai.com.br";
    Object.assign(navigator, {
      clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  });

  it("renders the ready-to-paste snippet for the tenant", () => {
    render(<TenantSnippet tenant={{ id: "demo-cliente" }} />);
    expect(
      screen.getByText('<script src="https://interasisai.com.br/widget/demo-cliente" async></script>'),
    ).toBeInTheDocument();
  });

  it("copies the snippet when the copy button is clicked", async () => {
    render(<TenantSnippet tenant={{ id: "demo-cliente" }} />);

    fireEvent.click(screen.getByRole("button", { name: "Copiar" }));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      '<script src="https://interasisai.com.br/widget/demo-cliente" async></script>',
    );
    expect(await screen.findByRole("button", { name: "Copiado" })).toBeInTheDocument();
  });
});
