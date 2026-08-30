import { buildConnectBreadcrumbJsonLd, buildConnectServiceJsonLd } from "./connectStructuredData";

describe("connectStructuredData", () => {
  describe("buildConnectServiceJsonLd", () => {
    it("returns a Service schema populated from the given parameters", () => {
      const jsonLd = buildConnectServiceJsonLd({
        locale: "pt-BR",
        siteUrl: "https://interasisai.com.br",
        name: "InterasisAI Connect",
        description: "Arquitetura de atendimento com RAG.",
      });

      expect(jsonLd["@type"]).toBe("Service");
      expect(jsonLd.name).toBe("InterasisAI Connect");
      expect(jsonLd.description).toBe("Arquitetura de atendimento com RAG.");
      expect((jsonLd.provider as { name: string }).name).toBe("Interasis AI");
      expect(jsonLd.url).toBe("https://interasisai.com.br/pt-BR/interasisai-connect");
    });
  });

  describe("buildConnectBreadcrumbJsonLd", () => {
    it("returns a BreadcrumbList with exactly 2 items in the correct order", () => {
      const jsonLd = buildConnectBreadcrumbJsonLd({
        locale: "pt-BR",
        siteUrl: "https://interasisai.com.br",
        homeLabel: "Início",
        pageLabel: "InterasisAI Connect",
      });

      expect(jsonLd["@type"]).toBe("BreadcrumbList");
      const items = jsonLd.itemListElement as Array<{
        position: number;
        name: string;
        item: string;
      }>;
      expect(items).toHaveLength(2);
      expect(items[0]).toMatchObject({
        position: 1,
        name: "Início",
        item: "https://interasisai.com.br/pt-BR",
      });
      expect(items[1]).toMatchObject({
        position: 2,
        name: "InterasisAI Connect",
        item: "https://interasisai.com.br/pt-BR/interasisai-connect",
      });
    });
  });
});
