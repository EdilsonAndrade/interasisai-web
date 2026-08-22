import { isPromptBindingMissing } from "./promptBinding";

describe("isPromptBindingMissing", () => {
  it("returns true for an operational tenant resolved to the default prompt", () => {
    expect(
      isPromptBindingMissing({ node_type: "operational", is_default_prompt: true }),
    ).toBe(true);
  });

  it("returns false for an operational tenant with its own binding", () => {
    expect(
      isPromptBindingMissing({ node_type: "operational", is_default_prompt: false }),
    ).toBe(false);
  });

  it("returns false for institutional even when is_default_prompt is true (out of scope guard)", () => {
    expect(
      isPromptBindingMissing({ node_type: "institutional", is_default_prompt: true }),
    ).toBe(false);
  });

  it("returns false for chitchat even when is_default_prompt is true (out of scope guard)", () => {
    expect(
      isPromptBindingMissing({ node_type: "chitchat", is_default_prompt: true }),
    ).toBe(false);
  });
});
