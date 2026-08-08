import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AdminLoginForm } from "./AdminLoginForm";

const login = jest.fn();

jest.mock("@/hooks/useAdminAuth", () => ({
  useAdminAuth: () => ({ login, isLoading: false, error: null }),
}));

describe("AdminLoginForm", () => {
  beforeEach(() => login.mockReset());

  it("shows accessible validation errors", async () => {
    render(<AdminLoginForm />);

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findAllByRole("alert")).toHaveLength(2);
    expect(login).not.toHaveBeenCalled();
  });

  it("submits valid credentials", async () => {
    login.mockResolvedValue(undefined);
    render(<AdminLoginForm />);

    fireEvent.change(screen.getByLabelText("Usuário"), {
      target: { value: "admin" },
    });
    fireEvent.change(screen.getByLabelText("Senha"), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() =>
      expect(login).toHaveBeenCalledWith(
        { user: "admin", password: "secret" },
        expect.anything(),
      ),
    );
  });
});