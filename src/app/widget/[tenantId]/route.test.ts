/** @jest-environment node */

import { readFile } from "node:fs/promises";
import { GET } from "./route";
import { getTenantById } from "@/services/pythonBackend";

jest.mock("node:fs/promises", () => ({
  readFile: jest.fn(),
}));

jest.mock("@/services/pythonBackend", () => ({
  getTenantById: jest.fn(),
}));

const readFileMock = jest.mocked(readFile);
const getTenantByIdMock = jest.mocked(getTenantById);

describe("GET /widget/[tenantId]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getTenantByIdMock.mockResolvedValue({
      ok: false,
      status: 404,
      message: "not found",
      blockers: [],
      retryable: false,
    });
  });

  it("returns the bundle with the tenantId and tenant name injected and the correct headers", async () => {
    readFileMock.mockResolvedValue("console.log('bundle');");
    getTenantByIdMock.mockResolvedValue({
      ok: true,
      status: 200,
      tenant: {
        id: "demo-cliente",
        name: "Demo Cliente Ltda",
        google_calendar_id: "",
        created_at: "",
        updated_at: null,
        deleted_at: null,
        allowed_domains: [],
        scheduling_enabled: true,
      },
    });

    const response = await GET(new Request("http://localhost/widget/demo-cliente"), {
      params: Promise.resolve({ tenantId: "demo-cliente" }),
    });
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/javascript; charset=utf-8");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=300");
    expect(body).toBe(
      'const __INTERASIS_TENANT_ID__ = "demo-cliente";\n' +
        'const __INTERASIS_TENANT_NAME__ = "Demo Cliente Ltda";\n' +
        "console.log('bundle');",
    );
  });

  it("injects an empty tenant name when the tenant lookup fails", async () => {
    readFileMock.mockResolvedValue("console.log('bundle');");

    const response = await GET(new Request("http://localhost/widget/demo-cliente"), {
      params: Promise.resolve({ tenantId: "demo-cliente" }),
    });
    const body = await response.text();

    expect(body).toContain('const __INTERASIS_TENANT_NAME__ = "";');
  });

  it("escapes double quotes in the tenantId to avoid breaking out of the injected script string", async () => {
    readFileMock.mockResolvedValue("/* bundle */");

    const response = await GET(new Request("http://localhost/widget/weird"), {
      params: Promise.resolve({ tenantId: 'weird"; alert(1); //' }),
    });
    const body = await response.text();

    expect(body).toContain('const __INTERASIS_TENANT_ID__ = "weird\\"; alert(1); //";');
  });

  it("returns an empty script without touching the filesystem when tenantId is blank", async () => {
    const response = await GET(new Request("http://localhost/widget/%20"), {
      params: Promise.resolve({ tenantId: "   " }),
    });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("");
    expect(readFileMock).not.toHaveBeenCalled();
  });

  it("returns an empty script when the bundle file is missing", async () => {
    readFileMock.mockRejectedValue(new Error("ENOENT"));

    const response = await GET(new Request("http://localhost/widget/demo-cliente"), {
      params: Promise.resolve({ tenantId: "demo-cliente" }),
    });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("");
  });
});
