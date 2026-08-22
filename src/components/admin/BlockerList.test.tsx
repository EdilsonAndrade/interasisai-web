import { fireEvent, render, screen } from "@testing-library/react";
import { BlockerList } from "./BlockerList";
import type { Blocker } from "@/lib/apiError";

describe("BlockerList", () => {
  it("renders nothing when there are no blockers", () => {
    const { container } = render(<BlockerList blockers={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the blocker name when present", () => {
    const blockers: Blocker[] = [{ type: "tenant", id: "acme", name: "Acme Ltda" }];

    render(<BlockerList blockers={blockers} />);

    expect(screen.getByText("Acme Ltda")).toBeInTheDocument();
  });

  it("falls back to the id when name is absent", () => {
    const blockers: Blocker[] = [{ type: "tenant", id: "inexistente-1" }];

    render(<BlockerList blockers={blockers} />);

    expect(screen.getByText("inexistente-1")).toBeInTheDocument();
  });

  it("shows the tenant count for prompt blockers", () => {
    const blockers: Blocker[] = [
      { type: "prompt", id: "p1", name: "Atendimento Padrão", tenant_count: 4 },
    ];

    render(<BlockerList blockers={blockers} />);

    expect(screen.getByText("(4 tenants)")).toBeInTheDocument();
  });

  it("calls onResolve with the clicked blocker", () => {
    const blockers: Blocker[] = [{ type: "tenant", id: "acme", name: "Acme Ltda" }];
    const onResolve = jest.fn();

    render(<BlockerList blockers={blockers} onResolve={onResolve} resolveLabel="Vincular" />);
    fireEvent.click(screen.getByRole("button", { name: "Vincular" }));

    expect(onResolve).toHaveBeenCalledWith(blockers[0]);
  });
});
