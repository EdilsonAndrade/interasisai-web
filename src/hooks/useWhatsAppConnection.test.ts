import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import {
  createWhatsAppInstance,
  getWhatsAppQrCode,
  type WhatsAppQrCodeResult,
} from "@/services";
import { WhatsAppConnectionProvider } from "@/context/WhatsAppConnectionContext";
import { useWhatsAppConnection } from "./useWhatsAppConnection";

jest.mock("@/services", () => ({
  createWhatsAppInstance: jest.fn(),
  getWhatsAppQrCode: jest.fn(),
}));

const createMock = jest.mocked(createWhatsAppInstance);
const getQrMock = jest.mocked(getWhatsAppQrCode);
const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(WhatsAppConnectionProvider, null, children);

describe("useWhatsAppConnection", () => {
  beforeEach(() => jest.clearAllMocks());

  it("stores a valid QR after instance creation", async () => {
    createMock.mockResolvedValue({
      ok: true,
      status: 201,
      message: "Criada",
      tenantId: "tenant-1",
      instanceName: "instance-1",
      qrCode: "data:image/png;base64,iVBORw0KGgo=",
    });
    const { result } = renderHook(() => useWhatsAppConnection(), { wrapper });

    await act(async () => {
      await result.current.createInstance({
        tenantId: "tenant-1",
        instanceName: "instance-1",
      });
    });

    expect(result.current.state.status).toBe("success");
    expect(result.current.qrCode?.instanceName).toBe("instance-1");
  });

  it("preserves an error and supports QR recovery", async () => {
    getQrMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      message: "Instância não encontrada.",
      retryable: false,
    });
    const { result } = renderHook(() => useWhatsAppConnection(), { wrapper });

    await act(async () => {
      await result.current.loadQrCode("missing");
    });
    expect(result.current.state).toEqual(
      expect.objectContaining({ status: "error", instanceName: "missing" }),
    );

    getQrMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      instanceName: "missing",
      qrCode: "data:image/png;base64,iVBORw0KGgo=",
    });
    await act(async () => {
      await result.current.loadQrCode("missing");
    });
    expect(result.current.state.status).toBe("success");
  });

  it("clears the QR when the flow is closed", async () => {
    getQrMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      instanceName: "instance-1",
      qrCode: "data:image/png;base64,iVBORw0KGgo=",
    });
    const { result } = renderHook(() => useWhatsAppConnection(), { wrapper });
    await act(async () => result.current.loadQrCode("instance-1"));

    act(() => result.current.clear());

    expect(result.current.qrCode).toBeNull();
    expect(result.current.state.status).toBe("idle");
  });

  it("does not let an older response replace the latest QR", async () => {
    let resolveOlder: (value: WhatsAppQrCodeResult) => void = () => undefined;
    getQrMock.mockImplementationOnce(
      () => new Promise((resolve) => { resolveOlder = resolve; }),
    );
    getQrMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      instanceName: "latest",
      qrCode: "data:image/png;base64,bGF0ZXN0",
    });
    const { result } = renderHook(() => useWhatsAppConnection(), { wrapper });

    let olderRequest: Promise<boolean> = Promise.resolve(false);
    act(() => {
      olderRequest = result.current.loadQrCode("older");
    });
    await act(async () => {
      await result.current.loadQrCode("latest");
    });
    await act(async () => {
      resolveOlder({
        ok: true,
        status: 200,
        instanceName: "older",
        qrCode: "data:image/png;base64,b2xkZXI=",
      });
      await olderRequest;
    });

    expect(result.current.qrCode?.instanceName).toBe("latest");
  });
});