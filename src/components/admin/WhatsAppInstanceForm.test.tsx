import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { WhatsAppInstanceForm } from "./WhatsAppInstanceForm";

const createInstance = jest.fn();
const loadQrCode = jest.fn();
const push = jest.fn();

jest.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
jest.mock("@/hooks/useWhatsAppConnection", () => ({
  useWhatsAppConnection: () => ({
    createInstance,
    loadQrCode,
    state: { status: "idle" },
  }),
}));

describe("WhatsAppInstanceForm", () => {
  beforeEach(() => jest.clearAllMocks());

  it("validates required create fields", async () => {
    render(<WhatsAppInstanceForm />);
    fireEvent.click(
      screen.getByRole("button", { name: "Cadastrar e gerar QR Code" }),
    );

    expect(await screen.findAllByRole("alert")).toHaveLength(2);
    expect(createInstance).not.toHaveBeenCalled();
  });

  it("creates and navigates to the encoded QR route", async () => {
    createInstance.mockResolvedValue(true);
    render(<WhatsAppInstanceForm />);
    fireEvent.change(screen.getByLabelText("Tenant ID"), {
      target: { value: "tenant-1" },
    });
    fireEvent.change(screen.getByLabelText("Nome da instância"), {
      target: { value: "loja sul/01" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Cadastrar e gerar QR Code" }),
    );

    await waitFor(() =>
      expect(push).toHaveBeenCalledWith(
        "/admin/whatsapp/loja%20sul%2F01/qrcode",
      ),
    );
  });

  it("reconnects using only the instance name", async () => {
    loadQrCode.mockResolvedValue(true);
    render(<WhatsAppInstanceForm />);
    fireEvent.change(screen.getByLabelText("Nome da instância"), {
      target: { value: "instance-1" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Reconectar / Ver QR Code" }),
    );

    await waitFor(() => expect(loadQrCode).toHaveBeenCalledWith("instance-1"));
    expect(push).toHaveBeenCalledWith(
      "/admin/whatsapp/instance-1/qrcode",
    );
  });
});