import { render, screen } from "@testing-library/react";

import Home from "./page";

describe("Home", () => {
  it("renders the initialized environment message", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "Interasis AI - Ambiente Inicializado" }),
    ).toBeInTheDocument();
  });
});