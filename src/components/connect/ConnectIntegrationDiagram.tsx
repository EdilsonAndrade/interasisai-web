"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

import type { IntegrationCategory } from "./types";

type ConnectIntegrationDiagramProps = {
  categories: IntegrationCategory[];
  nucleusLabel: string;
  ariaLabel: string;
  caption: string;
};

const NODE_RADIUS = 40;
const CENTER = 50;

function nodePosition(index: number, total: number) {
  const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
  return {
    x: CENTER + NODE_RADIUS * Math.cos(angle),
    y: CENTER + NODE_RADIUS * Math.sin(angle),
  };
}

export default function ConnectIntegrationDiagram({
  categories,
  nucleusLabel,
  ariaLabel,
  caption,
}: ConnectIntegrationDiagramProps) {
  const shouldReduceMotion = useReducedMotion();
  const arrowId = useId();

  return (
    <div role="img" aria-label={ariaLabel} className="mt-8">
      <div className="relative mx-auto hidden aspect-square max-w-xl md:block">
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <marker
              id={`connect-diagram-arrow-${arrowId}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="4"
              markerHeight="4"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 Z" className="fill-brand-primary" />
            </marker>
          </defs>
          {categories.map((category, index) => {
            const { x, y } = nodePosition(index, categories.length);

            if (shouldReduceMotion) {
              return (
                <path
                  key={category.id}
                  d={`M${CENTER},${CENTER} L${x},${y}`}
                  className="stroke-brand-primary"
                  strokeWidth={0.6}
                  fill="none"
                  markerEnd={`url(#connect-diagram-arrow-${arrowId})`}
                />
              );
            }

            return (
              <motion.path
                key={category.id}
                d={`M${CENTER},${CENTER} L${x},${y}`}
                className="stroke-brand-primary"
                strokeWidth={0.6}
                strokeDasharray="3 4"
                fill="none"
                markerEnd={`url(#connect-diagram-arrow-${arrowId})`}
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: -14 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            );
          })}
        </svg>

        <div
          className="absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill border border-brand-primary/40 bg-surface-base/90 px-4 py-2 text-center text-xs font-semibold text-brand-primary shadow-[0_0_15px_rgba(var(--color-brand-primary),0.5)]"
          title={nucleusLabel}
        >
          {nucleusLabel}
        </div>

        {categories.map((category, index) => {
          const { x, y } = nodePosition(index, categories.length);
          return (
            <div
              key={category.id}
              className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill border border-border-subtle/60 bg-surface-page/90 px-3 py-1.5 text-center text-xs font-semibold text-text-strong shadow-[0_0_15px_rgba(var(--color-brand-primary),0.35)]"
              style={{ left: `${x}%`, top: `${y}%` }}
              title={category.description}
            >
              {category.label}
            </div>
          );
        })}
      </div>

      <div className="mx-auto grid max-w-md grid-cols-2 gap-4 border-l-2 border-dashed border-border-subtle/60 pl-4 md:hidden">
        {categories.map((category) => (
          <div
            key={category.id}
            className="rounded-pill border border-border-subtle/60 bg-surface-page/90 px-3 py-1.5 text-center text-xs font-semibold text-text-strong"
            title={category.description}
          >
            {category.label}
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-sm text-text-body">{caption}</p>

      <ul className="sr-only">
        <li>{nucleusLabel}</li>
        {categories.map((category) => (
          <li key={category.id}>{category.label}</li>
        ))}
      </ul>
    </div>
  );
}
