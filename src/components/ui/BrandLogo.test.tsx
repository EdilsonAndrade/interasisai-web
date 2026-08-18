import { render, screen } from "@testing-library/react";

import BrandLogo from "./BrandLogo";

describe("BrandLogo", () => {
  it("renders header variant with link wrapper exposing single accessible name", () => {
    render(<BrandLogo variant="header" href="/" />);

    const links = screen.getAllByRole("link", { name: "Interasis AI - Página inicial" });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/");
    expect(screen.getByTestId("brand-logo-text")).toHaveTextContent("Interasis AI");
  });

  it("renders header variant without href as plain wordmark, no link role", () => {
    render(<BrandLogo variant="header" />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByTestId("brand-logo-text")).toHaveTextContent("Interasis AI");
  });

  it("renders footer variant styled for the fixed dark footer background", () => {
    render(<BrandLogo variant="footer" />);

    const wrapper = screen.getByTestId("brand-logo");
    expect(wrapper).toHaveAttribute("data-variant", "footer");
    expect(screen.getByTestId("brand-logo-text")).toHaveTextContent("Interasis AI");
  });

  it("does not depend on any external image asset", () => {
    render(<BrandLogo variant="header" href="/" />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("merges additional className without conflicting with internal classes", () => {
    render(<BrandLogo variant="footer" className="opacity-80 custom-class" />);

    const wrapper = screen.getByTestId("brand-logo");
    expect(wrapper.className).toEqual(expect.stringContaining("opacity-80"));
    expect(wrapper.className).toEqual(expect.stringContaining("custom-class"));
  });
});
