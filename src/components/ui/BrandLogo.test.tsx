import { fireEvent, render, screen } from "@testing-library/react";

import BrandLogo from "./BrandLogo";

describe("BrandLogo", () => {
  it("renders header variant with link wrapper exposing single accessible name", () => {
    render(<BrandLogo variant="header" href="/" />);

    const links = screen.getAllByRole("link", { name: "Interasis AI - Página inicial" });
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "/");

    const image = screen.getByTestId("brand-logo-image");
    expect(image).toHaveAttribute("alt", "");
  });

  it("renders header variant without href as image with alt text", () => {
    render(<BrandLogo variant="header" />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByAltText("Interasis AI")).toBeInTheDocument();
  });

  it("renders footer variant with image alt 'Interasis AI'", () => {
    render(<BrandLogo variant="footer" />);

    const image = screen.getByAltText("Interasis AI");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("data-variant", "footer");
  });

  it("falls back to text when image fails to load", () => {
    render(<BrandLogo variant="header" />);

    const image = screen.getByTestId("brand-logo-image");
    fireEvent.error(image);

    expect(screen.queryByTestId("brand-logo-image")).not.toBeInTheDocument();
    expect(screen.getByText("Interasis AI")).toBeInTheDocument();
  });

  it("merges additional className without conflicting with internal classes", () => {
    render(<BrandLogo variant="footer" className="opacity-80 custom-class" />);

    const image = screen.getByTestId("brand-logo-image");
    expect(image.className).toEqual(expect.stringContaining("opacity-80"));
    expect(image.className).toEqual(expect.stringContaining("custom-class"));
  });
});
