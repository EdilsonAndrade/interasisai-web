import { validateOfferText } from "./followUpOfferValidator";

describe("validateOfferText", () => {
  it("allows drafts that do not mention a discount", () => {
    expect(validateOfferText("Oi! Vi que você tinha interesse em nossa solução.", null)).toEqual({ isValid: true });
  });

  it("rejects a discount mention when no oferta is configured for the tenant", () => {
    const result = validateOfferText("Consigo liberar 10% de desconto para você.", null);
    expect(result.isValid).toBe(false);
    expect(result.message).toBe("Desconto mencionado mas nenhuma oferta configurada para este tenant");
  });

  it("accepts a discount percentage that matches the oferta vigente", () => {
    const result = validateOfferText("Consigo liberar 10% de desconto para você.", "Desconto de 10% + frete grátis");
    expect(result.isValid).toBe(true);
  });

  it("rejects a discount percentage not present in the oferta vigente", () => {
    const result = validateOfferText("Consigo liberar 50% de desconto para você.", "Desconto de 10% + frete grátis");
    expect(result.isValid).toBe(false);
    expect(result.message).toBe("A promoção mencionada não está configurada na oferta vigente deste tenant");
  });
});
