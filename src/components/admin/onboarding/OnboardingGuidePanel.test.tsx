import { fireEvent, render, screen } from "@testing-library/react";
import { useOnboardingGuideContext } from "@/context/OnboardingGuideContext";
import { OnboardingGuidePanel } from "./OnboardingGuidePanel";
import { ONBOARDING_STEPS } from "./onboardingSteps";

jest.mock("@/context/OnboardingGuideContext", () => ({
  useOnboardingGuideContext: jest.fn(),
}));

const useGuideMock = jest.mocked(useOnboardingGuideContext);
const guideActions = {
  minimizeGuide: jest.fn(),
  maximizeGuide: jest.fn(),
  toggleStepComplete: jest.fn(),
  disableGuide: jest.fn(),
};

describe("OnboardingGuidePanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when there is no active tenant", () => {
    useGuideMock.mockReturnValue({
      activeTenantId: null,
      completedSteps: [],
      isMinimized: false,
      ...guideActions,
    } as never);
    const { container } = render(<OnboardingGuidePanel />);

    expect(container).toBeEmptyDOMElement();
  });

  it("lists the 8 steps in the order defined by onboardingSteps.ts", () => {
    useGuideMock.mockReturnValue({
      activeTenantId: "tenant-1",
      completedSteps: [],
      isMinimized: false,
      ...guideActions,
    } as never);
    render(<OnboardingGuidePanel />);

    const items = screen.getAllByRole("checkbox");
    expect(items).toHaveLength(8);
    ONBOARDING_STEPS.forEach((step, index) => {
      expect(items[index]).toHaveAccessibleName(step.label);
    });
  });

  it("marks the items already completed for the active tenant as checked", () => {
    useGuideMock.mockReturnValue({
      activeTenantId: "tenant-1",
      completedSteps: ["operational_prompt", "identity_guardrail"],
      isMinimized: false,
      ...guideActions,
    } as never);
    render(<OnboardingGuidePanel />);

    expect(
      screen.getByRole("checkbox", { name: "Cadastrar prompt operacional" }),
    ).toHaveAttribute("aria-checked", "true");
    expect(
      screen.getByRole("checkbox", { name: "Cadastrar prompt institucional" }),
    ).toHaveAttribute("aria-checked", "false");
  });

  it("calls toggleStepComplete with the right step id when an item is clicked", () => {
    useGuideMock.mockReturnValue({
      activeTenantId: "tenant-1",
      completedSteps: [],
      isMinimized: false,
      ...guideActions,
    } as never);
    render(<OnboardingGuidePanel />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Cadastrar prompt operacional" }));

    expect(guideActions.toggleStepComplete).toHaveBeenCalledWith("operational_prompt");
  });

  it("calls toggleStepComplete again to unmark an already completed item", () => {
    useGuideMock.mockReturnValue({
      activeTenantId: "tenant-1",
      completedSteps: ["operational_prompt"],
      isMinimized: false,
      ...guideActions,
    } as never);
    render(<OnboardingGuidePanel />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Cadastrar prompt operacional" }));

    expect(guideActions.toggleStepComplete).toHaveBeenCalledWith("operational_prompt");
  });

  it("calls minimizeGuide when the minimize button is clicked", () => {
    useGuideMock.mockReturnValue({
      activeTenantId: "tenant-1",
      completedSteps: [],
      isMinimized: false,
      ...guideActions,
    } as never);
    render(<OnboardingGuidePanel />);

    fireEvent.click(screen.getByRole("button", { name: "Minimizar guia" }));

    expect(guideActions.minimizeGuide).toHaveBeenCalledTimes(1);
  });

  it("does not render a separate close button — minimizing is the only way back to the icon", () => {
    useGuideMock.mockReturnValue({
      activeTenantId: "tenant-1",
      completedSteps: [],
      isMinimized: false,
      ...guideActions,
    } as never);
    render(<OnboardingGuidePanel />);

    expect(screen.queryByRole("button", { name: "Fechar guia" })).not.toBeInTheDocument();
  });

  it("shows a floating bar instead of the full checklist when minimized", () => {
    useGuideMock.mockReturnValue({
      activeTenantId: "tenant-1",
      completedSteps: ["operational_prompt"],
      isMinimized: true,
      ...guideActions,
    } as never);
    render(<OnboardingGuidePanel />);

    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.getByText("1/8")).toBeInTheDocument();
  });

  it("calls maximizeGuide when the minimized bar is clicked", () => {
    useGuideMock.mockReturnValue({
      activeTenantId: "tenant-1",
      completedSteps: [],
      isMinimized: true,
      ...guideActions,
    } as never);
    render(<OnboardingGuidePanel />);

    fireEvent.click(screen.getByRole("button", { name: "Maximizar guia" }));

    expect(guideActions.maximizeGuide).toHaveBeenCalledTimes(1);
  });

  it("shows a visible option to disable the guide and calls disableGuide when used", () => {
    useGuideMock.mockReturnValue({
      activeTenantId: "tenant-1",
      completedSteps: [],
      isMinimized: false,
      ...guideActions,
    } as never);
    render(<OnboardingGuidePanel />);

    const disableButton = screen.getByRole("button", { name: /desativar guia/i });
    fireEvent.click(disableButton);

    expect(guideActions.disableGuide).toHaveBeenCalledTimes(1);
  });
});
