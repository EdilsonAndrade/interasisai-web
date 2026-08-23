// ============================================================================
// promptPlaceholderHelp — Mapa estático de placeholders aceitos por node_type
// Fonte: EDI-50, confirmado contra prompts/load_prompt.py, modules/ia/agent_graph.py
// e prompts/*.md no repositório agendamento-ia. Atualizar manualmente aqui caso
// o motor de renderização do backend passe a aceitar/exigir novos placeholders.
// ============================================================================

import type { NodeType } from "@/services/promptManager.types";

export interface PromptPlaceholder {
  token: string;
  required: boolean;
  description: string;
}

export interface PromptPlaceholderHelpEntry {
  placeholders: PromptPlaceholder[];
  example: string;
}

export type PromptPlaceholderHelpMap = Record<NodeType, PromptPlaceholderHelpEntry>;

export const promptPlaceholderHelp: PromptPlaceholderHelpMap = {
  operational: {
    placeholders: [
      { token: "{guardrails}", required: true, description: "Regras de segurança/negócio do tenant." },
      {
        token: "{tenant_id}",
        required: true,
        description:
          "ID do tenant — também usado como valor literal em instruções de chamada de tool; se ausente, o texto literal \"{tenant_id}\" pode vazar como parâmetro de tool.",
      },
      {
        token: "{contexto_formatado}",
        required: true,
        description: "Resultado da busca no RAG/PGVector. Sem ele, o bot não tem informação factual real da empresa.",
      },
      {
        token: "{tabela_calendario_str}",
        required: true,
        description: "Tabela dos próximos 7 dias, usada para mapear \"amanhã/segunda-feira\" em data ISO.",
      },
      {
        token: "{hora_atual_str}",
        required: true,
        description: "Hora atual, usada para não oferecer horários já passados hoje.",
      },
      { token: "{data_hoje_iso}", required: true, description: "Data de hoje em ISO." },
    ],
    example: `{guardrails}

Tenant: {tenant_id}

--- CONTEXT FROM KNOWLEDGE BASE ---
{contexto_formatado}

--- CALENDÁRIO (PRÓXIMOS 7 DIAS) ---
{tabela_calendario_str}

Hora atual: {hora_atual_str}
Data de hoje: {data_hoje_iso}`,
  },
  institutional: {
    placeholders: [
      { token: "{guardrails}", required: true, description: "Regras de segurança/negócio do tenant." },
      {
        token: "{historico_texto}",
        required: true,
        description:
          "Histórico da conversa em texto — este nó manda tudo como uma única string ao LLM, não como lista de mensagens.",
      },
      {
        token: "{contexto_formatado}",
        required: true,
        description: "Resultado da busca no RAG/PGVector. Sem ele, o bot não tem informação factual real da empresa.",
      },
      { token: "{pergunta_usuario}", required: true, description: "A pergunta atual do usuário." },
    ],
    example: `{guardrails}

--- CONVERSATION HISTORY ---
{historico_texto}

--- CONTEXT FROM KNOWLEDGE BASE ---
{contexto_formatado}

User Question: {pergunta_usuario}`,
  },
  chitchat: {
    placeholders: [
      { token: "{guardrails}", required: true, description: "Regras de segurança/negócio do tenant." },
    ],
    example: `{guardrails}

Converse de forma leve e amigável, mantendo o tom da marca.`,
  },
};
