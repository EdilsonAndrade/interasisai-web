import { estimateRealMessages } from "./messageLimitEstimate";

describe("estimateRealMessages", () => {
  it("divides calls by ratio, rounding up", () => {
    expect(estimateRealMessages(1000, 3)).toBe(334);
  });

  it("returns null for zero calls", () => {
    expect(estimateRealMessages(0, 3)).toBeNull();
  });

  it("returns null for negative calls", () => {
    expect(estimateRealMessages(-10, 3)).toBeNull();
  });

  it("returns null for a zero or negative ratio", () => {
    expect(estimateRealMessages(1000, 0)).toBeNull();
    expect(estimateRealMessages(1000, -1)).toBeNull();
  });

  it("returns null for NaN input", () => {
    expect(estimateRealMessages(NaN, 3)).toBeNull();
  });
});
