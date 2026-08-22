// ============================================================================
// Tests: promptManager — node_type query param on fetchTenantPromptDetail
// ============================================================================

import { fetchPrompts, fetchTenantPromptDetail } from "./promptManager";

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
