import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { GlobalNotificationRecipients } from "./GlobalNotificationRecipients";
import { useGlobalRecipientsManager } from "@/hooks/useGlobalRecipientsManager";

jest.mock("@/hooks/useGlobalRecipientsManager", () => ({
  useGlobalRecipientsManager: jest.fn(),
}));

const useGlobalRecipientsManagerMock = jest.mocked(useGlobalRecipientsManager);

const recipientA = { id: 1, email: "a@interasisai.com.br", active: true, created_at: "2026-08-25T10:00:00Z" };
const recipientB = { id: 2, email: "b@interasisai.com.br", active: false, created_at: "2026-08-25T10:00:00Z" };

function mockManager(overrides: Partial<ReturnType<typeof useGlobalRecipientsManager>> = {}) {
  const defaults: ReturnType<typeof useGlobalRecipientsManager> = {
    recipients: [recipientA, recipientB],
    loading: false,
    error: null,
    list: jest.fn(),
    create: jest.fn().mockResolvedValue(recipientA),
    update: jest.fn().mockResolvedValue(recipientA),
    remove: jest.fn().mockResolvedValue(undefined),
  };
  useGlobalRecipientsManagerMock.mockReturnValue({ ...defaults, ...overrides });
  return { ...defaults, ...overrides };
}

describe("GlobalNotificationRecipients", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the recipient list with active/inactive state", () => {
    mockManager();
    render(<GlobalNotificationRecipients />);

    expect(screen.getByText("a@interasisai.com.br")).toBeInTheDocument();
    expect(screen.getByText("b@interasisai.com.br")).toBeInTheDocument();
    expect(screen.getByText("Inativo")).toBeInTheDocument();
  });

  it("shows a loading state", () => {
    mockManager({ loading: true, recipients: [] });
    render(<GlobalNotificationRecipients />);
    expect(screen.getByText(/carregando destinatários/i)).toBeInTheDocument();
  });

  it("shows a fallback notice when the list is empty", () => {
    mockManager({ recipients: [] });
    render(<GlobalNotificationRecipients />);
    expect(screen.getByText(/contato@interasisai\.com\.br/)).toBeInTheDocument();
  });

  it("creates a new recipient on submit", async () => {
    const manager = mockManager();
    render(<GlobalNotificationRecipients />);

    fireEvent.change(screen.getByPlaceholderText("alerts@interasisai.com.br"), {
      target: { value: "new@interasisai.com.br" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    await waitFor(() => expect(manager.create).toHaveBeenCalledWith("new@interasisai.com.br"));
  });

  it("shows a specific message for a duplicate e-mail (409)", async () => {
    const create = jest.fn().mockRejectedValue({ code: "EMAIL_ALREADY_EXISTS" });
    mockManager({ create });
    render(<GlobalNotificationRecipients />);

    fireEvent.change(screen.getByPlaceholderText("alerts@interasisai.com.br"), {
      target: { value: "a@interasisai.com.br" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/já está cadastrado/i),
    );
  });

  it("blocks submission of a malformed e-mail before calling the API", async () => {
    const manager = mockManager();
    render(<GlobalNotificationRecipients />);

    fireEvent.change(screen.getByPlaceholderText("alerts@interasisai.com.br"), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/inválido/i);
    expect(manager.create).not.toHaveBeenCalled();
  });

  it("toggles active without removing the recipient", async () => {
    const manager = mockManager();
    render(<GlobalNotificationRecipients />);

    fireEvent.click(screen.getAllByRole("button", { name: "Desativar" })[0]);

    await waitFor(() => expect(manager.update).toHaveBeenCalledWith(1, false));
  });

  it("removes a recipient", async () => {
    const manager = mockManager();
    render(<GlobalNotificationRecipients />);

    fireEvent.click(screen.getByLabelText("Remover e-mail a@interasisai.com.br"));

    await waitFor(() => expect(manager.remove).toHaveBeenCalledWith(1));
  });
});
