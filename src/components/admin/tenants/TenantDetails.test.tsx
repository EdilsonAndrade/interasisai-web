import { fireEvent, render, screen } from "@testing-library/react";
import { TenantDetails } from "./TenantDetails";

const tenant = {
  id: "tenant-1",
  name: "Tenant One",
  google_calendar_id: "calendar",
  allowed_domains: ["example.com"],
  created_at: "2026-08-08T10:00:00Z",
  updated_at: "2026-08-08T11:00:00Z",
  deleted_at: null,
};

describe("TenantDetails", () => {
  it("renders tenant data and active actions", () => {
    render(<TenantDetails tenant={tenant} onEdit={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByRole("heading", { name: "Tenant One" })).toBeInTheDocument();
    expect(screen.getByText("tenant-1")).toBeInTheDocument();
    expect(screen.getByText("calendar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir" })).toBeInTheDocument();
  });

  it("triggers onDelete when the discreet DeleteAction is clicked", () => {
    const onDelete = jest.fn();
    render(<TenantDetails tenant={tenant} onEdit={jest.fn()} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("shows 'Nunca atualizado' instead of the literal 'Não informado' when updated_at is empty", () => {
    render(
      <TenantDetails
        tenant={{ ...tenant, updated_at: null }}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByText("Nunca atualizado")).toBeInTheDocument();
    expect(screen.queryByText("Não informado")).not.toBeInTheDocument();
  });

  it("hides mutation actions for a deleted tenant", () => {
    render(
      <TenantDetails
        tenant={{ ...tenant, deleted_at: "2026-08-08T12:00:00Z" }}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument();
    expect(screen.getByText("Tenant excluído")).toBeInTheDocument();
  });
});