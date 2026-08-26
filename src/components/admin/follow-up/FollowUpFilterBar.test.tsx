import { fireEvent, render, screen } from "@testing-library/react";
import { FollowUpFilterBar } from "./FollowUpFilterBar";

describe("FollowUpFilterBar", () => {
  it("applies the selected status and outcome filters", () => {
    const onFilterChange = jest.fn();
    render(<FollowUpFilterBar onFilterChange={onFilterChange} />);

    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "pendente" } });
    fireEvent.change(screen.getByLabelText("Outcome"), { target: { value: "sem_resposta" } });
    fireEvent.click(screen.getByRole("button", { name: "Filtrar" }));

    expect(onFilterChange).toHaveBeenCalledWith("pendente", "sem_resposta");
  });

  it("resets both filters to undefined", () => {
    const onFilterChange = jest.fn();
    render(<FollowUpFilterBar onFilterChange={onFilterChange} currentStatus="pendente" currentOutcome="sem_resposta" />);

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(onFilterChange).toHaveBeenCalledWith(undefined, undefined);
    expect(screen.getByLabelText("Status")).toHaveValue("");
    expect(screen.getByLabelText("Outcome")).toHaveValue("");
  });

  it("pre-selects filters from currentStatus/currentOutcome props", () => {
    render(<FollowUpFilterBar onFilterChange={jest.fn()} currentStatus="aprovado" currentOutcome="fechado" />);

    expect(screen.getByLabelText("Status")).toHaveValue("aprovado");
    expect(screen.getByLabelText("Outcome")).toHaveValue("fechado");
  });
});
