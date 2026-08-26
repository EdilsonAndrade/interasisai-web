"use client";

import { Calculator } from "lucide-react";
import { useId, useState } from "react";
import { useMessageLimitConfig } from "@/hooks/useMessageLimitConfig";
import { estimateRealMessages } from "@/lib/messageLimitEstimate";

type Scenario = "worst_case" | "average";

export function PlanCalculator() {
  const { config } = useMessageLimitConfig();
  const [llmCallsInput, setLlmCallsInput] = useState("");
  const [scenario, setScenario] = useState<Scenario>("worst_case");
  const inputId = useId();

  const llmCalls = Number(llmCallsInput);
  const ratio = scenario === "worst_case" ? config.worst_case_calls_per_message : config.average_calls_per_message;
  const estimate = llmCallsInput.trim() ? estimateRealMessages(llmCalls, ratio) : null;

  return (
    <section aria-labelledby="plan-calculator-heading" className="space-y-6 rounded-card border border-brand-primary/20 bg-surface-base/60 p-5 backdrop-blur-xl sm:p-7">
      <div>
        <h2 id="plan-calculator-heading" className="flex items-center gap-2 text-lg font-bold text-text-strong">
          <Calculator className="h-5 w-5" aria-hidden="true" />
          Calculadora de dimensionamento de plano
        </h2>
        <p className="mt-1 text-sm text-text-weak">
          Estime quantas mensagens reais de clientes finais um número de chamadas de LLM representa. Ferramenta de simulação — nada é salvo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor={inputId} className="text-sm font-medium text-text-body">
            Chamadas de LLM por mês
          </label>
          <input
            id={inputId}
            type="number"
            min={0}
            step={1}
            value={llmCallsInput}
            onChange={(event) => setLlmCallsInput(event.target.value)}
            placeholder="1000"
            className="w-full rounded-card border border-border-subtle bg-surface-subtle px-4 py-3 text-text-strong outline-none focus:border-brand-primary"
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-text-body">Cenário</legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-text-body">
              <input
                type="radio"
                name="calculator-scenario"
                checked={scenario === "worst_case"}
                onChange={() => setScenario("worst_case")}
                className="accent-brand-primary"
              />
              Pior caso ({config.worst_case_calls_per_message} chamadas/mensagem)
            </label>
            <label className="flex items-center gap-2 text-sm text-text-body">
              <input
                type="radio"
                name="calculator-scenario"
                checked={scenario === "average"}
                onChange={() => setScenario("average")}
                className="accent-brand-primary"
              />
              Médio ({config.average_calls_per_message} chamadas/mensagem)
            </label>
          </div>
        </fieldset>
      </div>

      <div aria-live="polite" className="rounded-card border border-border-subtle bg-surface-subtle p-4 text-sm">
        {estimate === null ? (
          <span className="text-text-weak">Informe um número de chamadas para ver a estimativa.</span>
        ) : (
          <span className="font-semibold text-text-strong">≈ {estimate} mensagens reais de clientes finais</span>
        )}
      </div>
    </section>
  );
}
