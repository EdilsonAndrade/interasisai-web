import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { FollowUpTenantConfig } from "@/services/followUpApi.types";
import { OfferForm } from "./OfferForm";

const config: FollowUpTenantConfig = {
  id: "acme",
  name: "ACME Inc",
  oferta_vigente_texto: "Desconto de 10% + frete grátis",
  oferta_vigente_validade: "2026-12-31T23:59:59Z",
  retention_days: 90,
};

describe("OfferForm", () => {
  it("pre-fills fields from the loaded config", () => {
    render(<OfferForm config={config} saving={false} error={null} onSave={jest.fn()} />);

    expect(screen.getByLabelText("Oferta Vigente")).toHaveValue(config.oferta_vigente_texto);
    expect(screen.getByLabelText("Validade da Oferta")).toHaveValue("2026-12-31");
    expect(screen.getByLabelText("Retenção do Histórico (dias)")).toHaveValue(90);
  });

  it("rejects a retention_days of zero without calling onSave", async () => {
    const onSave = jest.fn();
    render(<OfferForm config={config} saving={false} error={null} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText("Retenção do Histórico (dias)"), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar Configuração" }));

    await waitFor(() => expect(screen.getByText("Deve ser maior que 0")).toBeInTheDocument());
    expect(onSave).not.toHaveBeenCalled();
  });

  it("rejects an oferta validade in the past", async () => {
    const onSave = jest.fn();
    render(<OfferForm config={config} saving={false} error={null} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText("Validade da Oferta"), { target: { value: "2020-01-01" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar Configuração" }));

    await waitFor(() => expect(screen.getByText("Data de validade não pode estar no passado")).toBeInTheDocument());
    expect(onSave).not.toHaveBeenCalled();
  });

  it("submits a valid payload with the oferta and retention fields", async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);
    render(<OfferForm config={config} saving={false} error={null} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText("Retenção do Histórico (dias)"), { target: { value: "120" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar Configuração" }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          oferta_vigente_texto: config.oferta_vigente_texto,
          retention_days: 120,
        })
      )
    );
  });

  it("shows a service error passed in as a prop", () => {
    render(<OfferForm config={config} saving={false} error="Erro interno do servidor. Tente novamente." onSave={jest.fn()} />);
    expect(screen.getByText("Erro interno do servidor. Tente novamente.")).toBeInTheDocument();
  });

  it("disables the submit button while saving", () => {
    render(<OfferForm config={config} saving error={null} onSave={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Salvando..." })).toBeDisabled();
  });
});
