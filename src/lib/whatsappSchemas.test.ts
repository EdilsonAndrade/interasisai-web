import { adminLoginSchema, whatsappInstanceSchema } from "./whatsappSchemas";

describe("adminLoginSchema", () => {
  it("trims the user and accepts a non-empty password", () => {
    expect(
      adminLoginSchema.parse({ user: " admin ", password: "secret" }),
    ).toEqual({ user: "admin", password: "secret" });
  });

  it("rejects blank credentials", () => {
    expect(
      adminLoginSchema.safeParse({ user: "  ", password: "" }).success,
    ).toBe(false);
  });
});

describe("whatsappInstanceSchema", () => {
  it("trims tenant and instance identifiers", () => {
    expect(
      whatsappInstanceSchema.parse({
        tenantId: " tenant-1 ",
        instanceName: " instance-1 ",
      }),
    ).toEqual({ tenantId: "tenant-1", instanceName: "instance-1" });
  });

  it("rejects blank identifiers", () => {
    expect(
      whatsappInstanceSchema.safeParse({
        tenantId: " ",
        instanceName: " ",
      }).success,
    ).toBe(false);
  });
});