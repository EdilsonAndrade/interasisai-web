import { fireEvent, render, screen } from "@testing-library/react";

import ConnectVerticalComparison from "./ConnectVerticalComparison";
import type { VerticalScenario } from "./types";

const verticals: VerticalScenario[] = [
  {
    id: "buffet",
    tabLabel: "Buffet e eventos",
    customerQuestion: "Pergunta do buffet?",
    followUpQuestion: "Seguimento do buffet?",
    commonReply1: "Resposta comum 1 do buffet",
    commonReply2: "Resposta comum 2 do buffet",
    connectReply1: "Resposta connect 1 do buffet",
    connectReply2: "Resposta connect 2 do buffet",
    commonVerdict: "Veredito comum do buffet",
    connectVerdict: "Veredito connect do buffet",
  },
  {
    id: "clinica",
    tabLabel: "Clínica",
    customerQuestion: "Pergunta da clínica?",
    followUpQuestion: "Seguimento da clínica?",
    commonReply1: "Resposta comum 1 da clínica",
    commonReply2: "Resposta comum 2 da clínica",
    connectReply1: "Resposta connect 1 da clínica",
    connectReply2: "Resposta connect 2 da clínica",
    commonVerdict: "Veredito comum da clínica",
    connectVerdict: "Veredito connect da clínica",
  },
];

const labels = { common: "Chatbot comum", connect: "InterasisAI Connect" };
const badges = { common: "Hoje", connect: "Ao vivo" };

function renderComparison() {
  return render(
    <ConnectVerticalComparison verticals={verticals} labels={labels} badges={badges} />,
  );
}

describe("ConnectVerticalComparison", () => {
  it("renders the first vertical active by default, with the customer question in both columns", () => {
    renderComparison();

    expect(screen.getByRole("tab", { name: "Buffet e eventos" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getAllByText("Pergunta do buffet?")).toHaveLength(2);
    expect(screen.getByText("Resposta comum 1 do buffet")).toBeInTheDocument();
    expect(screen.getByText("Resposta connect 1 do buffet")).toBeInTheDocument();
    expect(screen.getByText("Veredito comum do buffet")).toBeInTheDocument();
    expect(screen.getByText("Veredito connect do buffet")).toBeInTheDocument();
  });

  it("labels each column clearly (common chatbot vs InterasisAI Connect) with a badge", () => {
    renderComparison();

    expect(screen.getAllByText("Chatbot comum")).toHaveLength(1);
    expect(screen.getAllByText("InterasisAI Connect")).toHaveLength(1);
    expect(screen.getByText("Hoje")).toBeInTheDocument();
    expect(screen.getByText("Ao vivo")).toBeInTheDocument();
  });

  it("switches the conversation simulation and verdicts when clicking another tab", () => {
    renderComparison();

    fireEvent.click(screen.getByRole("tab", { name: "Clínica" }));

    expect(screen.getByRole("tab", { name: "Clínica" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getAllByText("Pergunta da clínica?")).toHaveLength(2);
    expect(screen.getByText("Veredito comum da clínica")).toBeInTheDocument();
    expect(screen.queryByText("Pergunta do buffet?")).not.toBeInTheDocument();
  });

  it("supports switching tabs via keyboard (Enter)", () => {
    renderComparison();

    const clinicaTab = screen.getByRole("tab", { name: "Clínica" });
    clinicaTab.focus();
    fireEvent.keyDown(clinicaTab, { key: "Enter", code: "Enter" });

    expect(screen.getAllByText("Pergunta da clínica?")).toHaveLength(2);
  });

  it("supports switching tabs via keyboard (ArrowRight)", () => {
    renderComparison();

    const buffetTab = screen.getByRole("tab", { name: "Buffet e eventos" });
    buffetTab.focus();
    fireEvent.keyDown(buffetTab, { key: "ArrowRight", code: "ArrowRight" });

    expect(screen.getByRole("tab", { name: "Clínica" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Clínica" })).toHaveFocus();
  });

  it("never navigates away while switching tabs (no anchor/link elements)", () => {
    renderComparison();

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
