import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { WhatsAppInstanceForm } from "./WhatsAppInstanceForm";

const createInstance = jest.fn();
const loadQrCode = jest.fn();
const push = jest.fn();
let searchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => searchParams,
}));
jest.mock("@/hooks/useWhatsAppConnection", () => ({
  useWhatsAppConnection: () => ({
    createInstance,
    loadQrCode,
    state: { status: "idle" },
  }),
}));

describe("WhatsAppInstanceForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    searchParams = new URLSearchParams();
  });

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

  it("pre-fills Tenant ID and Nome da instância from the query string, editably", () => {
    searchParams = new URLSearchParams({ tenantId: "tenant-42", instanceName: "Loja Sul" });
    render(<WhatsAppInstanceForm />);

    const tenantInput = screen.getByLabelText("Tenant ID") as HTMLInputElement;
    const instanceInput = screen.getByLabelText("Nome da instância") as HTMLInputElement;
    expect(tenantInput.value).toBe("tenant-42");
    expect(instanceInput.value).toBe("Loja Sul");

    fireEvent.change(instanceInput, { target: { value: "Loja Sul 02" } });
    expect(instanceInput.value).toBe("Loja Sul 02");
  });

  it("keeps the fields empty when no query string is present", () => {
    render(<WhatsAppInstanceForm />);

    expect((screen.getByLabelText("Tenant ID") as HTMLInputElement).value).toBe("");
    expect((screen.getByLabelText("Nome da instância") as HTMLInputElement).value).toBe("");
  });
});