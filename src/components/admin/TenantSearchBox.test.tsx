import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TenantSearchBox } from "./TenantSearchBox";

const tenant = {
  id: "1234",
  name: "Barbearia Central",
  google_calendar_id: "abc@group.calendar.google.com",
  allowed_domains: ["barbeariacentral.com.br"],
  created_at: "2026-01-10T12:00:00Z",
  updated_at: null,
  deleted_at: null,
};

describe("TenantSearchBox", () => {
  it("blocks submission and shows a required-field message for an empty term", async () => {
    const onSearch = jest.fn();
    render(
      <TenantSearchBox
        results={[]}
        loading={false}
        error={null}
        notFound={false}
        onSearch={onSearch}
        onSelect={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Informe um termo de busca."));
    expect(onSearch).not.toHaveBeenCalled();
  });

  it("submits the entered term", async () => {
    const onSearch = jest.fn();
    render(
      <TenantSearchBox
        results={[]}
        loading={false}
        error={null}
        notFound={false}
        onSearch={onSearch}
        onSelect={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Buscar tenant"), { target: { value: "Barbearia" } });
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    await waitFor(() => expect(onSearch).toHaveBeenCalledWith("Barbearia"));
  });

  it("renders selectable results and calls onSelect with the tenant id", () => {
    const onSelect = jest.fn();
    render(
      <TenantSearchBox
        results={[tenant]}
        loading={false}
        error={null}
        notFound={false}
        onSearch={jest.fn()}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Barbearia Central/ }));
    expect(onSelect).toHaveBeenCalledWith("1234");
  });

  it("shows the empty state when notFound is true", () => {
    render(
      <TenantSearchBox
        results={[]}
        loading={false}
        error={null}
        notFound
        onSearch={jest.fn()}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByText("Nenhum tenant encontrado.")).toBeInTheDocument();
  });

  it("shows a service error", () => {
    render(
      <TenantSearchBox
        results={[]}
        loading={false}
        error="Não foi possível conectar ao servidor. Verifique sua conexão."
        notFound={false}
        onSearch={jest.fn()}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível conectar ao servidor");
  });

  it("disables the search button while loading", () => {
    render(
      <TenantSearchBox
        results={[]}
        loading
        error={null}
        notFound={false}
        onSearch={jest.fn()}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Buscando..." })).toBeDisabled();
  });
});
