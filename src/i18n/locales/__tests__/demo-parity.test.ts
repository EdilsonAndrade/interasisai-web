import ptBR from "../pt-BR/demo.json";
import en from "../en/demo.json";
import es from "../es/demo.json";
import { DEMO_TENANTS } from "@/lib/demoTenants";

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

describe("demo.json i18n parity", () => {
  const ptKeys = keyPaths(ptBR).sort();
  const enKeys = keyPaths(en).sort();
  const esKeys = keyPaths(es).sort();

  it("has the same key set in en as in pt-BR", () => {
    expect(enKeys).toEqual(ptKeys);
  });

  it("has the same key set in es as in pt-BR", () => {
    expect(esKeys).toEqual(ptKeys);
  });

  it("has a translated entry for every slug in DEMO_TENANTS, in every locale", () => {
    const slugs = Object.keys(DEMO_TENANTS).sort();
    expect(Object.keys(ptBR.tenants).sort()).toEqual(slugs);
    expect(Object.keys(en.tenants).sort()).toEqual(slugs);
    expect(Object.keys(es.tenants).sort()).toEqual(slugs);
  });
});
