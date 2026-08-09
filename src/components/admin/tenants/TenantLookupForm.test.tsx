import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TenantLookupForm } from "./TenantLookupForm";

describe("TenantLookupForm", () => {
  it("validates and submits a normalized tenant id", async () => {
    const onLookup = jest.fn().mockResolvedValue(true);
    render(<TenantLookupForm isLoading={false} onLookup={onLookup} />);

    fireEvent.click(screen.getByRole("button", { name: "Buscar tenant" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("obrigatório");
    fireEvent.change(screen.getByLabelText("ID do tenant"), {
      target: { value: "  tenant-1  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Buscar tenant" }));

    await waitFor(() => expect(onLookup).toHaveBeenCalledWith("tenant-1"));
  });
});