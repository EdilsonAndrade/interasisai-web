import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { EmailListEditor } from "./EmailListEditor";

function Controlled({ initial = [] as string[] }) {
  const [value, setValue] = useState(initial);
  return (
    <EmailListEditor
      id="notification-emails"
      label="E-mails de notificação"
      value={value}
      onChange={setValue}
    />
  );
}

describe("EmailListEditor", () => {
  it("adds a valid e-mail via Enter and clears the input", () => {
    render(<Controlled />);
    const input = screen.getByLabelText("E-mails de notificação");

    fireEvent.change(input, { target: { value: "manager@buffet.com" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByText("manager@buffet.com")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("rejects a malformed e-mail with an inline error", () => {
    render(<Controlled />);
    const input = screen.getByLabelText("E-mails de notificação");

    fireEvent.change(input, { target: { value: "not-an-email" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByRole("alert")).toHaveTextContent(/inválido/i);
    expect(screen.queryByText("not-an-email")).not.toBeInTheDocument();
  });

  it("rejects a duplicate e-mail", () => {
    render(<Controlled initial={["a@b.com"]} />);
    const input = screen.getByLabelText("E-mails de notificação");

    fireEvent.change(input, { target: { value: "a@b.com" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByRole("alert")).toHaveTextContent(/já foi adicionado/i);
    expect(screen.getAllByText("a@b.com")).toHaveLength(1);
  });

  it("removes an e-mail from the list", () => {
    render(<Controlled initial={["a@b.com", "c@d.com"]} />);

    fireEvent.click(screen.getByLabelText("Remover e-mail a@b.com"));

    expect(screen.queryByText("a@b.com")).not.toBeInTheDocument();
    expect(screen.getByText("c@d.com")).toBeInTheDocument();
  });

  it("allows an empty list (no e-mails required)", () => {
    render(<Controlled />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("blocks adding beyond the 10-email limit", () => {
    const tenEmails = Array.from({ length: 10 }, (_, i) => `user${i}@example.com`);
    render(<Controlled initial={tenEmails} />);
    const input = screen.getByLabelText("E-mails de notificação");

    fireEvent.change(input, { target: { value: "eleventh@example.com" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByRole("alert")).toHaveTextContent(/máximo/i);
    expect(screen.queryByText("eleventh@example.com")).not.toBeInTheDocument();
  });
});
