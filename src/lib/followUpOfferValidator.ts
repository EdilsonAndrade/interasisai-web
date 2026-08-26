/**
 * Valida se o texto do rascunho menciona um desconto/percentual que não está
 * presente no texto de `oferta_vigente` configurado para o tenant — guardrail
 * client-side complementar ao guardrail do backend (EDI-53 FollowUpEntry).
 */
export function validateOfferText(
  draftText: string,
  ofertaVigenteText?: string | null
): { isValid: boolean; message?: string } {
  if (!draftText || !draftText.toLowerCase().includes("desconto")) {
    return { isValid: true };
  }

  if (!ofertaVigenteText) {
    return {
      isValid: false,
      message: "Desconto mencionado mas nenhuma oferta configurada para este tenant",
    };
  }

  const lowerOferta = ofertaVigenteText.toLowerCase();
  const discountMatches = draftText.match(/(\d+%?)/g) || [];
  const allMentionsAuthorized = discountMatches.every(mention => lowerOferta.includes(mention.toLowerCase()));

  if (!allMentionsAuthorized) {
    return {
      isValid: false,
      message: "A promoção mencionada não está configurada na oferta vigente deste tenant",
    };
  }

  return { isValid: true };
}
