import { fireEvent, render, screen } from "@testing-library/react";
import { useTenantManagement } from "@/hooks/useTenantManagement";
import { TenantManagement } from "./TenantManagement";

jest.mock("@/hooks/useTenantManagement", () => ({
  useTenantManagement: jest.fn(),
}));

const useTenantMock = jest.mocked(useTenantManagement);
const actions = {
  create: jest.fn().mockResolvedValue(true),
  lookup: jest.fn().mockResolvedValue(true),
  update: jest.fn().mockResolvedValue(true),
  remove: jest.fn().mockResolvedValue(true),
  clearFeedback: jest.fn(),
};

describe("TenantManagement", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useTenantMock.mockReturnValue({
      tenant: null,
      operation: null,
      isLoading: false,
      error: null,
      feedback: null,
      fieldErrors: undefined,
      ...actions,
    });
  });

  it("renders the first version without an invented listing", () => {
    render(<TenantManagement />);

    expect(screen.getByRole("heading", { name: "Tenants" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Novo tenant" })).toBeInTheDocument();
    expect(screen.getByLabelText("ID do tenant")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("opens the create form", () => {
    render(<TenantManagement />);
    fireEvent.click(screen.getByRole("button", { name: "Novo tenant" }));
    expect(screen.getByRole("dialog", { name: "Novo tenant" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nome do tenant")).toBeInTheDocument();
  });
});