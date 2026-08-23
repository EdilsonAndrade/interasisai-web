import { fireEvent, render, screen } from "@testing-library/react";
import { OnboardingGuideItem } from "./OnboardingGuideItem";

describe("OnboardingGuideItem", () => {
  it("shows a pulsing highlight while pending", () => {
    render(<OnboardingGuideItem label="Cadastrar prompt operacional" completed={false} onToggle={jest.fn()} />);

    const item = screen.getByRole("checkbox", { name: "Cadastrar prompt operacional" });
    expect(item).toHaveAttribute("aria-checked", "false");
    expect(item.querySelector(".animate-pulse")).not.toBeNull();
  });

  it("stops pulsing and shows as checked once completed", () => {
    render(<OnboardingGuideItem label="Cadastrar prompt operacional" completed onToggle={jest.fn()} />);

    const item = screen.getByRole("checkbox", { name: "Cadastrar prompt operacional" });
    expect(item).toHaveAttribute("aria-checked", "true");
    expect(item.querySelector(".animate-pulse")).toBeNull();
  });

  it("calls onToggle when clicked while pending", () => {
    const onToggle = jest.fn();
    render(<OnboardingGuideItem label="Cadastrar prompt operacional" completed={false} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Cadastrar prompt operacional" }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("calls onToggle again to unmark an already completed item", () => {
    const onToggle = jest.fn();
    render(<OnboardingGuideItem label="Cadastrar prompt operacional" completed onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("checkbox", { name: "Cadastrar prompt operacional" }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("is reachable and activatable by keyboard (native button semantics)", () => {
    const onToggle = jest.fn();
    render(<OnboardingGuideItem label="Cadastrar prompt operacional" completed={false} onToggle={onToggle} />);

    const item = screen.getByRole("checkbox", { name: "Cadastrar prompt operacional" });
    item.focus();
    expect(item).toHaveFocus();

    fireEvent.keyDown(item, { key: "Enter" });
    fireEvent.click(item);
    expect(onToggle).toHaveBeenCalled();
  });
});
