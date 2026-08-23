import { render, screen } from "@testing-library/react";
import { OnboardingPrerequisiteNotice } from "./OnboardingPrerequisiteNotice";

describe("OnboardingPrerequisiteNotice", () => {
  it("renders the reminder text about the initial prompt and the knowledge base", () => {
    render(<OnboardingPrerequisiteNotice />);

    expect(
      screen.getByText(/o prompt inicial e a base de conhecimento deste cliente já existem/i),
    ).toBeInTheDocument();
  });

  it("exposes no interactive control that could intercept or block an external action", () => {
    render(<OnboardingPrerequisiteNotice />);

    expect(screen.queryAllByRole("button")).toHaveLength(0);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });
});
