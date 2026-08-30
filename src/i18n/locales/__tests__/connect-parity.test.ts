import ptBR from "../pt-BR/connect.json";
import en from "../en/connect.json";
import es from "../es/connect.json";

function keyPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return value.length > 0 ? keyPaths(value[0], `${prefix}[]`) : [`${prefix}[]`];
  }
  if (value !== null && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      keyPaths(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [prefix];
}

describe("connect.json i18n parity", () => {
  const ptKeys = keyPaths(ptBR).sort();
  const enKeys = keyPaths(en).sort();
  const esKeys = keyPaths(es).sort();

  it("has the same key set in en as in pt-BR", () => {
    expect(enKeys).toEqual(ptKeys);
  });

  it("has the same key set in es as in pt-BR", () => {
    expect(esKeys).toEqual(ptKeys);
  });

  it("has exactly 5 verticals in every locale", () => {
    expect(ptBR.verticals).toHaveLength(5);
    expect(en.verticals).toHaveLength(5);
    expect(es.verticals).toHaveLength(5);
  });

  it("uses the same vertical ids, in the same order, across locales", () => {
    const ids = ptBR.verticals.map((v) => v.id);
    expect(en.verticals.map((v) => v.id)).toEqual(ids);
    expect(es.verticals.map((v) => v.id)).toEqual(ids);
  });
});
