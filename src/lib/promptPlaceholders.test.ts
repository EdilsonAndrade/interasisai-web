import { requiredPlaceholdersFor, missingRequiredPlaceholders } from "./promptPlaceholders";
import type { NodeType } from "@/services/promptManager.types";

describe("requiredPlaceholdersFor", () => {
  it("returns the 6 required tokens for operational, in map order", () => {
    expect(requiredPlaceholdersFor("operational")).toEqual([
      "{guardrails}",
      "{tenant_id}",
      "{contexto_formatado}",
      "{tabela_calendario_str}",
      "{hora_atual_str}",
      "{data_hoje_iso}",
    ]);
  });

  it("returns the 4 required tokens for institutional, in map order", () => {
    expect(requiredPlaceholdersFor("institutional")).toEqual([
      "{guardrails}",
      "{historico_texto}",
      "{contexto_formatado}",
      "{pergunta_usuario}",
    ]);
  });

  it("returns the single required token for chitchat", () => {
    expect(requiredPlaceholdersFor("chitchat")).toEqual(["{guardrails}"]);
  });

  it("returns an empty list for an unforeseen node_type instead of throwing", () => {
    expect(requiredPlaceholdersFor("unknown" as NodeType)).toEqual([]);
  });
});

describe("missingRequiredPlaceholders", () => {
  it("returns an empty list when the content has every required token", () => {
    const content = "{guardrails}\n{historico_texto}\n{contexto_formatado}\n{pergunta_usuario}";
    expect(missingRequiredPlaceholders(content, "institutional")).toEqual([]);
  });

  it("lists only the missing tokens, in map order", () => {
    const content = "{guardrails}\n{contexto_formatado}";
    expect(missingRequiredPlaceholders(content, "institutional")).toEqual([
      "{historico_texto}",
      "{pergunta_usuario}",
    ]);
  });

  it("treats empty content as missing every required token", () => {
    expect(missingRequiredPlaceholders("", "chitchat")).toEqual(["{guardrails}"]);
  });

  it("does not count casing/spacing variations as a literal match", () => {
    const content = "{ guardrails }\n{Guardrails}";
    expect(missingRequiredPlaceholders(content, "chitchat")).toEqual(["{guardrails}"]);
  });

  it("counts a repeated token as present", () => {
    const content = "{guardrails} ... {guardrails}";
    expect(missingRequiredPlaceholders(content, "chitchat")).toEqual([]);
  });

  it("returns an empty list for an unforeseen node_type instead of throwing", () => {
    expect(missingRequiredPlaceholders("qualquer conteúdo", "unknown" as NodeType)).toEqual([]);
  });
});
