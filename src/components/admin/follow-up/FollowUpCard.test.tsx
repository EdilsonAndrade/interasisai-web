import { fireEvent, render, screen } from "@testing-library/react";
import type { FollowUpQueueEntry } from "@/services/followUpApi.types";
import { FollowUpCard } from "./FollowUpCard";

const baseEntry: FollowUpQueueEntry = {
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

describe("FollowUpCard", () => {
  it("renders customer name, summary and draft", () => {
    render(<FollowUpCard entry={baseEntry} onEdit={jest.fn()} onDiscard={jest.fn()} onOptOut={jest.fn()} />);

    expect(screen.getByText("Maria")).toBeInTheDocument();
    expect(screen.getByText(baseEntry.summary)).toBeInTheDocument();
    expect(screen.getByText(baseEntry.draft_message as string)).toBeInTheDocument();
  });

  it("calls onEdit when the draft is editable for the outcome", () => {
    const onEdit = jest.fn();
    render(<FollowUpCard entry={baseEntry} onEdit={onEdit} onDiscard={jest.fn()} onOptOut={jest.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Editar / Aprovar" }));
    expect(onEdit).toHaveBeenCalledWith(baseEntry);
  });

  it("disables editing when outcome is not pensando/sem_resposta (EDI-53 backend guardrail)", () => {
    const entry = { ...baseEntry, outcome: "fechado" as const, draft_message: null };
    render(<FollowUpCard entry={entry} onEdit={jest.fn()} onDiscard={jest.fn()} onOptOut={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Editar / Aprovar" })).toBeDisabled();
  });

  it("calls onDiscard and onOptOut", () => {
    const onDiscard = jest.fn();
    const onOptOut = jest.fn();
    render(<FollowUpCard entry={baseEntry} onEdit={jest.fn()} onDiscard={onDiscard} onOptOut={onOptOut} />);

    fireEvent.click(screen.getByRole("button", { name: "Descartar" }));
    fireEvent.click(screen.getByRole("button", { name: "Opt-out" }));

    expect(onDiscard).toHaveBeenCalledWith(baseEntry);
    expect(onOptOut).toHaveBeenCalledWith(baseEntry);
  });

  it("hides action buttons when the entry is no longer pendente", () => {
    const entry = { ...baseEntry, status: "aprovado" as const };
    render(<FollowUpCard entry={entry} onEdit={jest.fn()} onDiscard={jest.fn()} onOptOut={jest.fn()} />);

    expect(screen.queryByRole("button", { name: "Editar / Aprovar" })).not.toBeInTheDocument();
  });
});
