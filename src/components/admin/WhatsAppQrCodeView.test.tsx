import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { WhatsAppQrCodeView } from "./WhatsAppQrCodeView";

const loadQrCode = jest.fn();
const clear = jest.fn();
const push = jest.fn();
let hookValue: Record<string, unknown>;

jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("@/hooks/useWhatsAppConnection", () => ({
  useWhatsAppConnection: () => hookValue,
}));

describe("WhatsAppQrCodeView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    hookValue = {
      qrCode: {
        instanceName: "instance-1",
        dataUrl: "data:image/png;base64,iVBORw0KGgo=",
        source: "create",
      },
      state: { status: "success", instanceName: "instance-1" },
      loadQrCode,
      clear,
    };
  });

  it("renders the QR, instructions and close action", () => {
    render(<WhatsAppQrCodeView instanceName="instance-1" />);

    expect(
      screen.getByRole("img", { name: /QR Code da instância instance-1/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Abra o WhatsApp no celular do cliente.")).toBeInTheDocument();
    expect(screen.getByText(/Aparelhos Conectados/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Concluído / Fechar" }),
    ).toBeInTheDocument();
  });

  it("clears and returns to the module when closed", () => {
    render(<WhatsAppQrCodeView instanceName="instance-1" />);
    fireEvent.click(
      screen.getByRole("button", { name: "Concluído / Fechar" }),
    );

    expect(clear).toHaveBeenCalled();
    expect(push).toHaveBeenCalledWith("/admin/whatsapp");
  });

  it("loads a QR automatically after direct access", async () => {
    hookValue = {
      qrCode: null,
      state: { status: "idle" },
      loadQrCode,
      clear,
    };
    render(<WhatsAppQrCodeView instanceName="instance-1" />);

    await waitFor(() => expect(loadQrCode).toHaveBeenCalledWith("instance-1"));
  });

  it("shows a stable loading state", () => {
    hookValue = {
      qrCode: null,
      state: {
        status: "loading",
        operation: "reconnect",
        instanceName: "instance-1",
      },
      loadQrCode,
      clear,
    };

    render(<WhatsAppQrCodeView instanceName="instance-1" />);

    expect(screen.getByText("Gerando QR Code...")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /QR Code/ })).not.toBeInTheDocument();
  });

  it("shows the service error and retries", () => {
    hookValue = {
      qrCode: null,
      state: {
        status: "error",
        operation: "reconnect",
        instanceName: "instance-1",
        message: "QR Code expirado.",
        retryable: true,
      },
      loadQrCode,
      clear,
    };

    render(<WhatsAppQrCodeView instanceName="instance-1" />);
    expect(screen.getByRole("alert")).toHaveTextContent("QR Code expirado.");
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));

    expect(loadQrCode).toHaveBeenCalledWith("instance-1");
  });
});