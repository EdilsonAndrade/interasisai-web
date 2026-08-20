// ============================================================================
// Tests: promptManagerSchemas — promptFormSchema.node_type validation
// ============================================================================

import { promptFormSchema } from "./promptManagerSchemas";

describe("promptFormSchema", () => {
  const baseData = {
    titulo: "Atendimento Inicial",
    conteudo: "# Prompt\n\nConteúdo",
    is_default: false,
    guardrail_ids: [] as string[],
  };

  it("accepts node_type operational", () => {
    const result = promptFormSchema.safeParse({ ...baseData, node_type: "operational" });
    expect(result.success).toBe(true);
  });

  it("accepts node_type institutional", () => {
    const result = promptFormSchema.safeParse({ ...baseData, node_type: "institutional" });
    expect(result.success).toBe(true);
  });

  it("accepts node_type chitchat", () => {
    const result = promptFormSchema.safeParse({ ...baseData, node_type: "chitchat" });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown node_type", () => {
    const result = promptFormSchema.safeParse({ ...baseData, node_type: "unknown_node" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing node_type", () => {
    const result = promptFormSchema.safeParse(baseData);
    expect(result.success).toBe(false);
  });
});
