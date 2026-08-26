import { render, screen } from "@testing-library/react";
import { TenantUsageIndicator } from "./TenantUsageIndicator";

describe("TenantUsageIndicator", () => {
  it("shows a loading skeleton while fetching", () => {
    render(<TenantUsageIndicator usage={null} loading={true} error={null} />);
    expect(screen.getByLabelText("Carregando consumo do mês")).toBeInTheDocument();
  });

  it("shows a degraded state when the fetch fails", () => {
    render(<TenantUsageIndicator usage={null} loading={false} error="Erro de rede" />);
    expect(screen.getByText(/indisponível/i)).toBeInTheDocument();
  });

  it("shows a neutral state when there is no limit configured", () => {
    render(
      <TenantUsageIndicator
        usage={{
          tenant_id: "tenant-1",
          monthly_message_limit: null,
          current_month_calls: 42,
          percentage_used: null,
          blocked: false,
        }}
        loading={false}
        error={null}
      />,
    );
    expect(screen.getByText(/sem limite configurado/i)).toBeInTheDocument();
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it("renders green under 50%", () => {
    render(
      <TenantUsageIndicator
        usage={{
          tenant_id: "tenant-1",
          monthly_message_limit: 500,
          current_month_calls: 156,
          percentage_used: 31.2,
          blocked: false,
        }}
        loading={false}
        error={null}
      />,
    );
    const text = screen.getByText("156 / 500 mensagens (31%)");
    expect(text).toHaveClass("text-emerald-300");
  });

  it("renders yellow between 50 and 80%", () => {
    render(
      <TenantUsageIndicator
        usage={{
          tenant_id: "tenant-1",
          monthly_message_limit: 500,
          current_month_calls: 300,
          percentage_used: 60,
          blocked: false,
        }}
        loading={false}
        error={null}
      />,
    );
    expect(screen.getByText("300 / 500 mensagens (60%)")).toHaveClass("text-amber-300");
  });

  it("renders red at or above 80% and shows blocked badge", () => {
    render(
      <TenantUsageIndicator
        usage={{
          tenant_id: "tenant-1",
          monthly_message_limit: 500,
          current_month_calls: 500,
          percentage_used: 100,
          blocked: true,
        }}
        loading={false}
        error={null}
      />,
    );
    expect(screen.getByText("500 / 500 mensagens (100%)")).toHaveClass("text-red-300");
    expect(screen.getByText("Bloqueado")).toBeInTheDocument();
  });

  it("sets an accessible progressbar reflecting the percentage", () => {
    render(
      <TenantUsageIndicator
        usage={{
          tenant_id: "tenant-1",
          monthly_message_limit: 500,
          current_month_calls: 156,
          percentage_used: 31.2,
          blocked: false,
        }}
        loading={false}
        error={null}
      />,
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "31");
  });
});
