"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";

import type { VerticalScenario } from "./types";

type ConnectVerticalComparisonProps = {
  verticals: VerticalScenario[];
  labels: { common: string; connect: string };
  badges: { common: string; connect: string };
};

export default function ConnectVerticalComparison({
  verticals,
  labels,
  badges,
}: ConnectVerticalComparisonProps) {
  const baseId = useId();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [activeId, setActiveId] = useState<VerticalScenario["id"] | undefined>(verticals[0]?.id);
  const active = verticals.find((vertical) => vertical.id === activeId) ?? verticals[0];

  if (!active) return null;

  const tabId = (id: VerticalScenario["id"]) => `${baseId}-tab-${id}`;
  const panelId = `${baseId}-panel`;

  const activateTab = (id: VerticalScenario["id"]) => {
    setActiveId(id);
    tabRefs.current[id]?.focus();
  };

  const handleTabKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateTab(verticals[index].id);
      return;
    }
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (index + delta + verticals.length) % verticals.length;
      activateTab(verticals[nextIndex].id);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      activateTab(verticals[0].id);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      activateTab(verticals[verticals.length - 1].id);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label="Escolha o tipo de negócio"
        className="flex flex-wrap gap-2"
      >
        {verticals.map((vertical, index) => {
          const isActive = vertical.id === active.id;
          return (
            <button
              key={vertical.id}
              ref={(el) => {
                tabRefs.current[vertical.id] = el;
              }}
              id={tabId(vertical.id)}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              tabIndex={isActive ? 0 : -1}
              onClick={() => activateTab(vertical.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={`rounded-pill px-4 py-1.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-brand-primary/60 ${
                isActive
                  ? "bg-brand-primary text-text-inverse"
                  : "border border-border-subtle/60 text-text-body hover:border-brand-primary/40"
              }`}
            >
              {vertical.tabLabel}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId(active.id)}
        tabIndex={0}
        className="grid gap-4 focus:outline-none md:grid-cols-2"
      >
        {/* Common chatbot thread */}
        <div className="flex flex-col rounded-card border border-border-subtle/60 bg-surface-page/50 p-4">
          <div className="mb-3 flex items-center justify-between gap-2 border-b border-border-subtle/40 pb-3">
            <span className="text-sm font-bold text-text-strong">{labels.common}</span>
            <span className="rounded-pill bg-border-subtle/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-body">
              {badges.common}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <p className="self-start max-w-[88%] rounded-2xl rounded-bl-sm bg-surface-base/80 px-3 py-2 text-sm text-text-strong">
              {active.customerQuestion}
            </p>
            <p className="self-end max-w-[88%] whitespace-pre-line rounded-2xl rounded-br-sm bg-border-subtle/40 px-3 py-2 text-sm text-text-body">
              {active.commonReply1}
            </p>
            <p className="self-start max-w-[88%] rounded-2xl rounded-bl-sm bg-surface-base/80 px-3 py-2 text-sm text-text-strong">
              {active.followUpQuestion}
            </p>
            <p className="self-end max-w-[88%] whitespace-pre-line rounded-2xl rounded-br-sm bg-border-subtle/40 px-3 py-2 text-sm text-text-body">
              {active.commonReply2}
            </p>
          </div>
          <p className="mt-4 border-t border-border-subtle/40 pt-3 text-center text-xs font-semibold text-red-400">
            {active.commonVerdict}
          </p>
        </div>

        {/* InterasisAI Connect thread */}
        <div className="flex flex-col rounded-card border border-brand-primary/40 bg-brand-primary/5 p-4">
          <div className="mb-3 flex items-center justify-between gap-2 border-b border-brand-primary/20 pb-3">
            <span className="text-sm font-bold text-brand-primary">{labels.connect}</span>
            <span className="rounded-pill bg-brand-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-text-inverse">
              {badges.connect}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <p className="self-start max-w-[88%] rounded-2xl rounded-bl-sm bg-surface-base/80 px-3 py-2 text-sm text-text-strong">
              {active.customerQuestion}
            </p>
            <p className="self-end max-w-[88%] rounded-2xl rounded-br-sm bg-brand-primary px-3 py-2 text-sm text-text-inverse">
              {active.connectReply1}
            </p>
            <p className="self-start max-w-[88%] rounded-2xl rounded-bl-sm bg-surface-base/80 px-3 py-2 text-sm text-text-strong">
              {active.followUpQuestion}
            </p>
            <p className="self-end max-w-[88%] rounded-2xl rounded-br-sm bg-brand-primary px-3 py-2 text-sm text-text-inverse">
              {active.connectReply2}
            </p>
          </div>
          <p className="mt-4 border-t border-brand-primary/20 pt-3 text-center text-xs font-semibold text-brand-primary">
            {active.connectVerdict}
          </p>
        </div>
      </div>
    </div>
  );
}
