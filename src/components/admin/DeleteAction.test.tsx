import { fireEvent, render, screen } from "@testing-library/react";
import { DeleteAction } from "./DeleteAction";

describe("DeleteAction", () => {
  it("renders the default label and calls onClick when pressed", () => {
    const onClick = jest.fn();
    render(<DeleteAction onClick={onClick} />);

    const button = screen.getByRole("button", { name: "Excluir" });
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("supports a custom label and accessible name", () => {
    const onClick = jest.fn();
    render(<DeleteAction onClick={onClick} label="Remover" ariaLabel="Remover Prompt X" />);

    expect(screen.getByRole("button", { name: "Remover Prompt X" })).toHaveTextContent("Remover");
  });

  it("does not call onClick when disabled", () => {
    const onClick = jest.fn();
    render(<DeleteAction onClick={onClick} disabled />);

    const button = screen.getByRole("button", { name: "Excluir" });
    expect(button).toBeDisabled();
    fireEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });
});
