import { fireEvent, render, screen } from "@testing-library/react";
import { TenantGrid } from "./TenantGrid";

const items = [
  { id: "tenant-1", name: "Acme Barbearia" },
  { id: "tenant-2", name: "Clínica Vida" },
] as never;

function renderGrid(overrides: Partial<React.ComponentProps<typeof TenantGrid>> = {}) {
  const onSelect = jest.fn();
  const onPrevious = jest.fn();
  const onNext = jest.fn();

  const props: React.ComponentProps<typeof TenantGrid> = {
    items,
    total: 2,
    offset: 0,
    limit: 20,
    loading: false,
    error: null,
    hasPrevious: false,
    hasNext: false,
    onSelect,
    onPrevious,
    onNext,
    ...overrides,
  };

  render(<TenantGrid {...props} />);
  return { onSelect, onPrevious, onNext };
}

describe("TenantGrid", () => {
  it("renders one row per tenant with id and name", () => {
    renderGrid();

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("tenant-1")).toBeInTheDocument();
    expect(screen.getByText("Acme Barbearia")).toBeInTheDocument();
    expect(screen.getByText("tenant-2")).toBeInTheDocument();
    expect(screen.getByText("Clínica Vida")).toBeInTheDocument();
  });

  it("calls onSelect with the tenant id when a row is clicked", () => {
    const { onSelect } = renderGrid();

    fireEvent.click(screen.getByRole("button", { name: /Acme Barbearia/ }));

    expect(onSelect).toHaveBeenCalledWith("tenant-1");
  });

  it("disables Anterior/Próxima according to hasPrevious/hasNext", () => {
    renderGrid({ hasPrevious: false, hasNext: true });

    expect(screen.getByRole("button", { name: /Anterior/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Próxima/ })).toBeEnabled();
  });

  it("calls onNext/onPrevious when the pagination buttons are clicked", () => {
    const { onNext, onPrevious } = renderGrid({ hasPrevious: true, hasNext: true });

    fireEvent.click(screen.getByRole("button", { name: /Próxima/ }));
    fireEvent.click(screen.getByRole("button", { name: /Anterior/ }));

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onPrevious).toHaveBeenCalledTimes(1);
  });

  it("shows a loading indicator instead of the table", () => {
    renderGrid({ loading: true });

    expect(screen.getByText("Carregando tenants...")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows an error instead of the table", () => {
    renderGrid({ loading: false, error: "Não foi possível conectar ao servidor. Verifique sua conexão." });

    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível conectar ao servidor");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("shows an empty state when there are no tenants", () => {
    renderGrid({ items: [] as never, total: 0 });

    expect(screen.getByText("Nenhum tenant cadastrado.")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
