const initSessionMock = jest.fn();
const mountWidgetMock = jest.fn();

async function loadIndexWithTenantId(tenantId: string): Promise<void> {
  (globalThis as unknown as { __INTERASIS_TENANT_ID__: string }).__INTERASIS_TENANT_ID__ =
    tenantId;
  await import("./index");
  // Let the fire-and-forget bootstrap() promise chain settle.
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("widget bootstrap (src/widget/index.ts)", () => {
  beforeEach(() => {
    jest.resetModules();
    initSessionMock.mockReset();
    mountWidgetMock.mockReset();
    jest.doMock("./state", () => ({ initSession: initSessionMock }));
    jest.doMock("./render", () => ({ mountWidget: mountWidgetMock }));
  });

  it("mounts the widget when session initialization succeeds", async () => {
    initSessionMock.mockResolvedValue(true);

    await loadIndexWithTenantId("demo-cliente");

    expect(initSessionMock).toHaveBeenCalledWith("demo-cliente");
    expect(mountWidgetMock).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when session initialization fails (unauthorized domain, deleted tenant, network error)", async () => {
    initSessionMock.mockResolvedValue(false);

    await loadIndexWithTenantId("demo-cliente");

    expect(initSessionMock).toHaveBeenCalledWith("demo-cliente");
    expect(mountWidgetMock).not.toHaveBeenCalled();
  });

  it("never calls initSession when no tenantId is injected", async () => {
    await loadIndexWithTenantId("   ");

    expect(initSessionMock).not.toHaveBeenCalled();
    expect(mountWidgetMock).not.toHaveBeenCalled();
  });
});
