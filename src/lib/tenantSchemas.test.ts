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
      }),
    ).toEqual({
      name: "Tenant Alpha",
      google_calendar_id: "agenda@group.calendar.google.com",
    });
  });

  it("rejects blank tenant write fields", () => {
    const result = tenantWriteSchema.safeParse({
      name: "   ",
      google_calendar_id: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors).toEqual({
        name: ["O nome do tenant é obrigatório."],
        google_calendar_id: ["O ID do Google Calendar é obrigatório."],
      });
    }
  });

  it("requires and trims tenant_id for creation", () => {
    expect(
      tenantCreateSchema.parse({
        tenant_id: "  tenant-1  ",
        name: "  Tenant One  ",
        google_calendar_id: "  calendar  ",
      }),
    ).toEqual({
      tenant_id: "tenant-1",
      name: "Tenant One",
      google_calendar_id: "calendar",
    });
    expect(
      tenantCreateSchema.safeParse({
        tenant_id: "   ",
        name: "Tenant One",
        google_calendar_id: "calendar",
      }).success,
    ).toBe(false);
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