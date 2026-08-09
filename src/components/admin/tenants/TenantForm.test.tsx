import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TenantForm } from "./TenantForm";

describe("TenantForm", () => {
  it("validates required fields and submits normalized create input", async () => {
    const onSubmit = jest.fn().mockResolvedValue(true);
    render(
      <TenantForm
        mode="create"
        isLoading={false}
        onCancel={jest.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cadastrar tenant" }));
    expect(await screen.findAllByRole("alert")).toHaveLength(3);

    fireEvent.change(screen.getByLabelText("Nome do tenant"), {
      target: { value: "  Tenant One  " },
    });
    fireEvent.change(screen.getByLabelText("ID do Google Calendar"), {
      target: { value: "  calendar  " },
    });
    fireEvent.change(screen.getByLabelText("ID do tenant"), {
      target: { value: "  tenant-1  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar tenant" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        tenant_id: "tenant-1",
        name: "Tenant One",
        google_calendar_id: "calendar",
      }),
    );
  });

  it("shows loading and server field errors in edit mode", () => {
    render(
      <TenantForm
        mode="edit"
        initialValues={{
          tenant_id: "tenant-1",
          name: "One",
          google_calendar_id: "calendar",
        }}
        isLoading
        fieldErrors={{ name: "Nome já utilizado" }}
        onCancel={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Nome já utilizado");
    expect(screen.getByRole("button", { name: "Salvando" })).toBeDisabled();
  });
});