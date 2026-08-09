import { fireEvent, render, screen } from "@testing-library/react";
import { TenantDeleteDialog } from "./TenantDeleteDialog";

describe("TenantDeleteDialog", () => {
  it("identifies the tenant and requires explicit confirmation", () => {
    const onConfirm = jest.fn();
    render(
      <TenantDeleteDialog
        open
        tenantName="Tenant One"
        isLoading={false}
        onCancel={jest.fn()}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Excluir tenant?" })).toBeInTheDocument();
    expect(screen.getByText("Tenant One")).toBeInTheDocument();
    expect(screen.getByText("Esta ação não poderá ser desfeita.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});