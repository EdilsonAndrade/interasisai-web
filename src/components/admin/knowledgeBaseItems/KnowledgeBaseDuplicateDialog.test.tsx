import { fireEvent, render, screen, within } from "@testing-library/react";
import { KnowledgeBaseDuplicateDialog } from "./KnowledgeBaseDuplicateDialog";

const conflicts = [
  { filename: "precos.xlsx", existing_item_id: "item-1" },
  { filename: "servicos.csv", existing_item_id: "item-2" },
];

describe("KnowledgeBaseDuplicateDialog", () => {
  it("renders one row per conflicting filename", () => {
    render(
      <KnowledgeBaseDuplicateDialog
        open
        conflicts={conflicts}
        isLoading={false}
        onCancel={jest.fn()}
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByText("precos.xlsx")).toBeInTheDocument();
    expect(screen.getByText("servicos.csv")).toBeInTheDocument();
  });

  it("defaults every conflict to 'keep both' and submits that when unchanged", () => {
    const onSubmit = jest.fn();
    render(
      <KnowledgeBaseDuplicateDialog
        open
        conflicts={conflicts}
        isLoading={false}
        onCancel={jest.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(onSubmit).toHaveBeenCalledWith([
      { filename: "precos.xlsx", action: "keep_both", existing_item_id: "item-1" },
      { filename: "servicos.csv", action: "keep_both", existing_item_id: "item-2" },
    ]);
  });

  it("submits a per-file choice when the admin selects 'replace' for one file only", () => {
    const onSubmit = jest.fn();
    render(
      <KnowledgeBaseDuplicateDialog
        open
        conflicts={conflicts}
        isLoading={false}
        onCancel={jest.fn()}
        onSubmit={onSubmit}
      />,
    );

    const precosRow = screen.getByText("precos.xlsx").closest("li")!;
    fireEvent.click(within(precosRow).getByRole("radio", { name: "Substituir" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(onSubmit).toHaveBeenCalledWith([
      { filename: "precos.xlsx", action: "replace", existing_item_id: "item-1" },
      { filename: "servicos.csv", action: "keep_both", existing_item_id: "item-2" },
    ]);
  });

  it("calls onCancel when cancelled", () => {
    const onCancel = jest.fn();
    render(
      <KnowledgeBaseDuplicateDialog
        open
        conflicts={conflicts}
        isLoading={false}
        onCancel={onCancel}
        onSubmit={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
