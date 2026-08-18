import { render, screen } from "@testing-library/react";
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