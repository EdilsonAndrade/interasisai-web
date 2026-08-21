import { render, screen } from "@testing-library/react";
import { GuardrailScopeBadge } from "./GuardrailScopeBadge";

describe("GuardrailScopeBadge", () => {
  it("renders the 'Global' label with an accessible tooltip when isGlobal is true", () => {
    render(<GuardrailScopeBadge isGlobal />);

    const badge = screen.getByText("Global");
    expect(badge).toBeInTheDocument();

    const tooltipId = badge.getAttribute("aria-describedby");
    expect(tooltipId).toBeTruthy();
    const tooltip = document.getElementById(tooltipId as string);
    expect(tooltip).toHaveTextContent("Este guardrail se aplica a todos os tenants");
  });

  it("renders nothing when isGlobal is false", () => {
    const { container } = render(<GuardrailScopeBadge isGlobal={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("is reachable by keyboard focus (not hover-only)", () => {
    render(<GuardrailScopeBadge isGlobal />);

    const badge = screen.getByText("Global");
    expect(badge).toHaveAttribute("tabIndex", "0");

    badge.focus();
    expect(badge).toHaveFocus();
  });
});
