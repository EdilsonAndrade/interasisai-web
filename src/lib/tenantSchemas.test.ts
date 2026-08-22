import {
  tenantCreateSchema,
  tenantLookupSchema,
  tenantWriteSchema,
} from "./tenantSchemas";

describe("tenant schemas", () => {
  it("trims valid tenant write input", () => {
    expect(
      tenantWriteSchema.parse({
        name: "  Tenant Alpha  ",
        google_calendar_id: "  agenda@group.calendar.google.com  ",
        allowed_domains: ["  example.com  "],
      }),
    ).toEqual({
      name: "Tenant Alpha",
      google_calendar_id: "agenda@group.calendar.google.com",
      allowed_domains: ["example.com"],
    });
  });

  it("rejects blank tenant write fields", () => {
    const result = tenantWriteSchema.safeParse({
      name: "   ",
      google_calendar_id: "",
      allowed_domains: [],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toEqual({
        name: ["O nome do tenant é obrigatório."],
        google_calendar_id: ["O ID do Google Calendar é obrigatório."],
        allowed_domains: ["Adicione pelo menos um domínio permitido."],
      });
    }
  });

  it("requires and trims tenant_id for creation", () => {
    expect(
      tenantCreateSchema.parse({
        tenant_id: "  tenant-1  ",
        name: "  Tenant One  ",
        google_calendar_id: "  calendar  ",
        allowed_domains: ["  example.com  "],
        prompt_id: "prompt-1",
      }),
    ).toEqual({
      tenant_id: "tenant-1",
      name: "Tenant One",
      google_calendar_id: "calendar",
      allowed_domains: ["example.com"],
      prompt_id: "prompt-1",
    });
    expect(
      tenantCreateSchema.safeParse({
        tenant_id: "   ",
        name: "Tenant One",
        google_calendar_id: "calendar",
        allowed_domains: ["example.com"],
        prompt_id: "prompt-1",
      }).success,
    ).toBe(false);
  });

  it("rejects a blank prompt_id with a message that explains why it is required", () => {
    const result = tenantCreateSchema.safeParse({
      tenant_id: "tenant-1",
      name: "Tenant One",
      google_calendar_id: "calendar",
      allowed_domains: ["example.com"],
      prompt_id: "   ",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.prompt_id).toEqual([
        "Selecione o prompt que este tenant vai usar. Sem prompt vinculado, o atendimento não funciona.",
      ]);
    }
  });

  it("accepts domains without protocols or ports only", () => {
    expect(tenantWriteSchema.safeParse({
      name: "Tenant One",
      google_calendar_id: "calendar",
      allowed_domains: ["localhost"],
    }).success).toBe(true);
    expect(tenantWriteSchema.safeParse({
      name: "Tenant One",
      google_calendar_id: "calendar",
      allowed_domains: ["https://example.com"],
    }).success).toBe(false);
    expect(tenantWriteSchema.safeParse({
      name: "Tenant One",
      google_calendar_id: "calendar",
      allowed_domains: ["example.com:8080"],
    }).success).toBe(false);
  });

  it("trims and requires a tenant lookup id", () => {
    expect(tenantLookupSchema.parse({ tenantId: "  tenant-1  " })).toEqual({
      tenantId: "tenant-1",
    });
    expect(
      tenantLookupSchema.safeParse({ tenantId: "   " }).success,
    ).toBe(false);
  });
});