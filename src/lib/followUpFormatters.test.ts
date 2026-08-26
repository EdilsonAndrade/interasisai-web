import { formatStatus, formatOutcome, isDraftEditable, DRAFT_EDITABLE_OUTCOMES } from "./followUpFormatters";

describe("formatStatus", () => {
  it("translates known statuses to Portuguese labels", () => {
    expect(formatStatus("pendente")).toBe("Pendente");
    expect(formatStatus("opt_out")).toBe("Opt-out");
  });
});

describe("formatOutcome", () => {
  it("translates known outcomes to Portuguese labels", () => {
    expect(formatOutcome("sem_resposta")).toBe("Sem Resposta");
    expect(formatOutcome("em_andamento")).toBe("Em Andamento");
  });
});

describe("isDraftEditable", () => {
  it("is editable only for pensando and sem_resposta outcomes (EDI-53 backend guardrail)", () => {
    expect(DRAFT_EDITABLE_OUTCOMES).toEqual(["pensando", "sem_resposta"]);
    expect(isDraftEditable("pensando")).toBe(true);
    expect(isDraftEditable("sem_resposta")).toBe(true);
    expect(isDraftEditable("fechado")).toBe(false);
    expect(isDraftEditable("recusado")).toBe(false);
    expect(isDraftEditable("em_andamento")).toBe(false);
  });
});
