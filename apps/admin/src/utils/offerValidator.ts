/**
 * Valida se texto contém oferta não-autorizada
 * Busca palavras-chave como "desconto", "promoção", "condição"
 * e verifica se estão presentes na ofertaVigente configurada
 */
export function validateOfferText(draftText: string, ofertaVigenteText?: string | null): {
  isValid: boolean
  message?: string
} {
  if (!draftText || !draftText.toLowerCase().includes('desconto')) {
    return { isValid: true }
  }

  if (!ofertaVigenteText) {
    return {
      isValid: false,
      message: 'Desconto mencionado mas nenhuma oferta configurada para este tenant',
    }
  }

  // Verificar se o desconto mencionado está presente na oferta vigente
  const lowerDraft = draftText.toLowerCase()
  const lowerOferta = ofertaVigenteText.toLowerCase()

  // Extrair menções de desconto do draft (e.g., "10%", "20%")
  const discountMatches = draftText.match(/(\d+%?)/g) || []

  // Verificar se alguma menção está na oferta vigente
  const allMentionsAuthorized = discountMatches.every(mention =>
    lowerOferta.includes(mention.toLowerCase())
  )

  if (!allMentionsAuthorized) {
    return {
      isValid: false,
      message: 'A promoção mencionada não está configurada na oferta vigente deste tenant',
    }
  }

  return { isValid: true }
}
