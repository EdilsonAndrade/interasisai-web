import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { FollowUpQueueEntry } from "@/services/followUpApi.types";
import { FollowUpEditModal } from "./FollowUpEditModal";

const entry: FollowUpQueueEntry = {
  id: 1,
  tenant_id: "acme",
  base_thread_id: "acme:5511999999999",
  customer_name: "Maria",
  outcome: "sem_resposta",
  summary: "Cliente perguntou sobre horário e não respondeu mais.",
  draft_message: "Oi Maria! Vi que você tinha interesse em...",
  status: "pendente",
  created_at: "2026-08-26T20:00:00Z",
};

describe("FollowUpEditModal", () => {
  it("renders nothing when there is no selected entry", () => {
    const { container } = render(
      <FollowUpEditModal entry={null} onApprove={jest.fn()} onDiscard={jest.fn()} onClose={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("pre-fills the textarea with the entry's draft_message", () => {
    render(<FollowUpEditModal entry={entry} onApprove={jest.fn()} onDiscard={jest.fn()} onClose={jest.fn()} />);
    expect(screen.getByLabelText("Rascunho da Mensagem")).toHaveValue(entry.draft_message);
  });

  it("blocks approval and shows an error for an empty draft", async () => {
    const onApprove = jest.fn();
    render(<FollowUpEditModal entry={entry} onApprove={onApprove} onDiscard={jest.fn()} onClose={jest.fn()} />);

    fireEvent.change(screen.getByLabelText("Rascunho da Mensagem"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Aprovar" }));

    await waitFor(() => expect(screen.getByText("Rascunho não pode estar vazio")).toBeInTheDocument());
    expect(onApprove).not.toHaveBeenCalled();
  });

  it("blocks approval when the draft mentions a discount outside the oferta vigente", async () => {
    const onApprove = jest.fn();
    render(
      <FollowUpEditModal
        entry={entry}
        tenantOferta="Desconto de 10% + frete grátis"
        onApprove={onApprove}
        onDiscard={jest.fn()}
        onClose={jest.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText("Rascunho da Mensagem"), {
      target: { value: "Consigo liberar 50% de desconto para você." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Aprovar" }));

    await waitFor(() =>
      expect(screen.getByText("A promoção mencionada não está configurada na oferta vigente deste tenant")).toBeInTheDocument()
    );
    expect(onApprove).not.toHaveBeenCalled();
  });

  it("approves with the edited draft text", async () => {
    const onApprove = jest.fn().mockResolvedValue(undefined);
    render(<FollowUpEditModal entry={entry} onApprove={onApprove} onDiscard={jest.fn()} onClose={jest.fn()} />);

    fireEvent.change(screen.getByLabelText("Rascunho da Mensagem"), { target: { value: "Texto revisado" } });
    fireEvent.click(screen.getByRole("button", { name: "Aprovar" }));

    await waitFor(() => expect(onApprove).toHaveBeenCalledWith("Texto revisado"));
  });

  it("requires a second confirmation before discarding", async () => {
    const onDiscard = jest.fn().mockResolvedValue(undefined);
    render(<FollowUpEditModal entry={entry} onApprove={jest.fn()} onDiscard={onDiscard} onClose={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Descartar" }));
    expect(onDiscard).not.toHaveBeenCalled();
    expect(screen.getByText("Descartar Rascunho?")).toBeInTheDocument();

    const confirmButtons = screen.getAllByRole("button", { name: "Descartar" });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);
    await waitFor(() => expect(onDiscard).toHaveBeenCalled());
  });
});
