import { EditDraftSchema, UpdateFollowUpTenantConfigSchema } from "./followUpSchemas";

describe("EditDraftSchema", () => {
  it("accepts a non-empty draft within the length limit", () => {
    expect(EditDraftSchema.safeParse({ draftMessage: "Oi, tudo bem?" }).success).toBe(true);
  });

  it("rejects an empty draft", () => {
    const result = EditDraftSchema.safeParse({ draftMessage: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Rascunho não pode estar vazio");
    }
  });

  it("rejects a draft longer than 1000 characters", () => {
    const result = EditDraftSchema.safeParse({ draftMessage: "a".repeat(1001) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Rascunho muito longo");
    }
  });
});

describe("UpdateFollowUpTenantConfigSchema", () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const futureDate = tomorrow.toISOString();

  it("accepts a config with no oferta configured", () => {
    const result = UpdateFollowUpTenantConfigSchema.safeParse({
      oferta_vigente_texto: null,
      oferta_vigente_validade: null,
      retention_days: 90,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid oferta with a future validade", () => {
    const result = UpdateFollowUpTenantConfigSchema.safeParse({
      oferta_vigente_texto: "10% off",
      oferta_vigente_validade: futureDate,
      retention_days: 90,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a validade in the past", () => {
    const result = UpdateFollowUpTenantConfigSchema.safeParse({
      oferta_vigente_texto: "10% off",
      oferta_vigente_validade: "2020-01-01T00:00:00.000Z",
      retention_days: 90,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some(i => i.message === "Data de validade não pode estar no passado")).toBe(true);
    }
  });

  it("requires a validade when oferta text is present", () => {
    const result = UpdateFollowUpTenantConfigSchema.safeParse({
      oferta_vigente_texto: "10% off",
      oferta_vigente_validade: null,
      retention_days: 90,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(i => i.message === "Informe a data de validade quando houver texto de oferta")
      ).toBe(true);
    }
  });

  it("rejects a non-positive retention_days", () => {
    const result = UpdateFollowUpTenantConfigSchema.safeParse({
      oferta_vigente_texto: null,
      oferta_vigente_validade: null,
      retention_days: 0,
    });
    expect(result.success).toBe(false);
  });
});
