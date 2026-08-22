// ============================================================================
// Tests: promptManager — node_type query param on fetchTenantPromptDetail
// ============================================================================

import { fetchPrompts, fetchTenantPromptDetail, fetchPromptTenants, linkTenantsBulk } from "./promptManager";

type MockResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

function createMockResponse(status: number, payload: unknown): MockResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => payload,
  };
}

const fetchMock = jest.fn();

describe("promptManager — fetchTenantPromptDetail node_type", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL = "http://test-api.example.com";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL;
  });

  it("omits the node_type query param when none is given", async () => {
    fetchMock.mockResolvedValueOnce(createMockResponse(200, {}));

    await fetchTenantPromptDetail("tenant-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://test-api.example.com/api/v1/prompt-manager/tenant/tenant-1",
      expect.anything(),
    );
  });

  it("appends the node_type query param when given", async () => {
    fetchMock.mockResolvedValueOnce(createMockResponse(200, {}));

    await fetchTenantPromptDetail("tenant-1", "chitchat");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://test-api.example.com/api/v1/prompt-manager/tenant/tenant-1?node_type=chitchat",
      expect.anything(),
    );
  });
});

describe("promptManager — fetchPrompts node_type filter", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL = "http://test-api.example.com";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL;
  });

  it("omits the node_type query param when none is given", async () => {
    fetchMock.mockResolvedValueOnce(createMockResponse(200, []));

    await fetchPrompts(undefined);

    expect(fetchMock).toHaveBeenCalledWith(
      "http://test-api.example.com/api/v1/prompt-manager/prompts",
      expect.anything(),
    );
  });

  it("applies the node_type query param when given", async () => {
    fetchMock.mockResolvedValueOnce(createMockResponse(200, []));

    await fetchPrompts(undefined, "operational");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://test-api.example.com/api/v1/prompt-manager/prompts?node_type=operational",
      expect.anything(),
    );
  });
});

describe("promptManager — fetchPromptTenants", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL = "http://test-api.example.com";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL;
  });

  it("returns the tenants linked to a prompt on success", async () => {
    const payload = {
      prompt_id: "prompt-1",
      node_type: "operational",
      tenants: [{ id: "acme", name: "Acme Ltda" }],
    };
    fetchMock.mockResolvedValueOnce(createMockResponse(200, payload));

    const result = await fetchPromptTenants("prompt-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://test-api.example.com/api/v1/prompt-manager/prompts/prompt-1/tenants",
      expect.anything(),
    );
    expect(result).toEqual({ ok: true, status: 200, data: payload });
  });

  it("returns PROMPT_NOT_FOUND when the prompt does not exist", async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse(404, {
        detail: { code: "PROMPT_NOT_FOUND", message: "Prompt não encontrado.", blockers: [] },
      }),
    );

    const result = await fetchPromptTenants("prompt-missing");

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("PROMPT_NOT_FOUND");
  });
});

describe("promptManager — linkTenantsBulk", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
    process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL = "http://test-api.example.com";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL;
  });

  it("posts prompt_id and tenant_ids and returns linked_count on success", async () => {
    const payload = {
      prompt_id: "prompt-1",
      node_type: "operational",
      linked_count: 2,
      tenant_ids: ["acme", "beta"],
    };
    fetchMock.mockResolvedValueOnce(createMockResponse(200, payload));

    const result = await linkTenantsBulk({ prompt_id: "prompt-1", tenant_ids: ["acme", "beta"] });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://test-api.example.com/api/v1/prompt-manager/link-tenants",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ prompt_id: "prompt-1", tenant_ids: ["acme", "beta"] }),
      }),
    );
    expect(result).toEqual({ ok: true, status: 200, data: payload });
  });

  it("returns TENANT_NOT_FOUND with blockers when a tenant does not exist", async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse(404, {
        detail: {
          code: "TENANT_NOT_FOUND",
          message: "1 tenant informado não existe. Nenhum vínculo foi aplicado.",
          blockers: [{ type: "tenant", id: "inexistente-1" }],
        },
      }),
    );

    const result = await linkTenantsBulk({ prompt_id: "prompt-1", tenant_ids: ["inexistente-1"] });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("TENANT_NOT_FOUND");
      expect(result.blockers).toEqual([{ type: "tenant", id: "inexistente-1" }]);
    }
  });

  it("returns PROMPT_NOT_FOUND when the prompt does not exist", async () => {
    fetchMock.mockResolvedValueOnce(
      createMockResponse(404, {
        detail: { code: "PROMPT_NOT_FOUND", message: "Prompt não encontrado.", blockers: [] },
      }),
    );

    const result = await linkTenantsBulk({ prompt_id: "prompt-missing", tenant_ids: ["acme"] });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("PROMPT_NOT_FOUND");
  });
});
