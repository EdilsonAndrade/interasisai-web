/** @jest-environment node */

import { readFile } from "node:fs/promises";
import { GET } from "./route";

jest.mock("node:fs/promises", () => ({
  readFile: jest.fn(),
}));

const readFileMock = jest.mocked(readFile);

describe("GET /widget/[tenantId]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns the bundle with the tenantId injected and the correct headers", async () => {
    readFileMock.mockResolvedValue("console.log('bundle');");

    const response = await GET(new Request("http://localhost/widget/demo-cliente"), {
      params: Promise.resolve({ tenantId: "demo-cliente" }),
    });
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/javascript; charset=utf-8");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=300");
    expect(body).toBe('const __INTERASIS_TENANT_ID__ = "demo-cliente";\nconsole.log(\'bundle\');');
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
