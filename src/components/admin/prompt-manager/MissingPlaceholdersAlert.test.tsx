import { fireEvent, render, screen } from "@testing-library/react";
import { MissingPlaceholdersAlert } from "./MissingPlaceholdersAlert";

describe("MissingPlaceholdersAlert", () => {
  it("renders each missing token in a <code> element", () => {
    render(
      <MissingPlaceholdersAlert
        missingTokens={["{guardrails}", "{contexto_formatado}"]}
        onFix={jest.fn()}
        onSaveAnyway={jest.fn()}
      />,
    );

    const guardrailsCode = screen.getByText("{guardrails}");
    const contextoCode = screen.getByText("{contexto_formatado}");
    expect(guardrailsCode.tagName).toBe("CODE");
    expect(contextoCode.tagName).toBe("CODE");
  });

  it("exposes role=alertdialog with a descriptive aria-label", () => {
    render(
      <MissingPlaceholdersAlert missingTokens={["{guardrails}"]} onFix={jest.fn()} onSaveAnyway={jest.fn()} />,
    );

    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveAttribute("aria-label", expect.stringMatching(/placeholders obrigat/i));
  });

  it("calls onFix when 'Corrigir' is clicked", () => {
    const onFix = jest.fn();
    render(
      <MissingPlaceholdersAlert missingTokens={["{guardrails}"]} onFix={onFix} onSaveAnyway={jest.fn()} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Corrigir" }));
    expect(onFix).toHaveBeenCalledTimes(1);
  });

  it("calls onSaveAnyway when 'Salvar mesmo assim' is clicked", () => {
    const onSaveAnyway = jest.fn();
    render(
      <MissingPlaceholdersAlert missingTokens={["{guardrails}"]} onFix={jest.fn()} onSaveAnyway={onSaveAnyway} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Salvar mesmo assim" }));
    expect(onSaveAnyway).toHaveBeenCalledTimes(1);
  });
});
