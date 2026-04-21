import { render, screen } from "@testing-library/react";

import FadeIn from "./FadeIn";

describe("FadeIn", () => {
  it("renders children without breaking composition", () => {
    render(
      <FadeIn>
        <div>Conteudo animado</div>
      </FadeIn>,
    );

    expect(screen.getByText("Conteudo animado")).toBeInTheDocument();
  });
});
