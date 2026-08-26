import { fireEvent, render, screen } from "@testing-library/react";
import { PlanCalculator } from "./PlanCalculator";
import { useMessageLimitConfig } from "@/hooks/useMessageLimitConfig";

jest.mock("@/hooks/useMessageLimitConfig", () => ({
  useMessageLimitConfig: jest.fn(),
}));

const useMessageLimitConfigMock = jest.mocked(useMessageLimitConfig);

describe("PlanCalculator", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useMessageLimitConfigMock.mockReturnValue({
      config: { worst_case_calls_per_message: 3, average_calls_per_message: 3 },
      loading: false,
      error: null,
    });
  });

  it("shows a neutral state before any input", () => {
    render(<PlanCalculator />);
    expect(screen.getByText(/informe um número de chamadas/i)).toBeInTheDocument();
  });

  it("computes the estimate for the worst-case scenario", () => {
    render(<PlanCalculator />);

    fireEvent.change(screen.getByLabelText(/chamadas de llm por mês/i), {
      target: { value: "1000" },
    });

    expect(screen.getByText(/≈ 334 mensagens reais/i)).toBeInTheDocument();
  });

  it("recalculates instantly when switching to the average scenario, without a network call", () => {
    useMessageLimitConfigMock.mockReturnValue({
      config: { worst_case_calls_per_message: 3, average_calls_per_message: 2 },
      loading: false,
      error: null,
    });
    render(<PlanCalculator />);

    fireEvent.change(screen.getByLabelText(/chamadas de llm por mês/i), {
      target: { value: "1000" },
    });
    expect(screen.getByText(/≈ 334 mensagens reais/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: /médio/i }));
    expect(screen.getByText(/≈ 500 mensagens reais/i)).toBeInTheDocument();
  });

  it("shows a neutral state for empty, zero or negative input", () => {
    render(<PlanCalculator />);
    const input = screen.getByLabelText(/chamadas de llm por mês/i);

    fireEvent.change(input, { target: { value: "0" } });
    expect(screen.getByText(/informe um número de chamadas/i)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "-5" } });
    expect(screen.getByText(/informe um número de chamadas/i)).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "" } });
    expect(screen.getByText(/informe um número de chamadas/i)).toBeInTheDocument();
  });
});
