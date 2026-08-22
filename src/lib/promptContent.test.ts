import { hasGuardrailsPlaceholder } from "./promptContent";

describe("hasGuardrailsPlaceholder", () => {
  it("returns true when the placeholder is present", () => {
    expect(hasGuardrailsPlaceholder("Você é um assistente.\n\n{guardrails}")).toBe(true);
  });

  it("returns true when the placeholder is embedded in a larger text", () => {
    expect(
      hasGuardrailsPlaceholder("Regras:\n{guardrails}\n\nSempre seja cordial."),
    ).toBe(true);
  });

  it("returns false when the placeholder is absent", () => {
    expect(hasGuardrailsPlaceholder("Você é um assistente cordial.")).toBe(false);
  });

  it("returns false when the placeholder was expanded/removed", () => {
    expect(hasGuardrailsPlaceholder("Regras: Nunca compartilhe dados sensíveis.")).toBe(
      false,
    );
  });

  it("returns false for empty content", () => {
    expect(hasGuardrailsPlaceholder("")).toBe(false);
  });
});
