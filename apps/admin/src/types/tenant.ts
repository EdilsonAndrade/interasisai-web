export interface OfferInfo {
  text: string
  validUntil: string
}

export interface TenantConfig {
  id: string
  tenantId: string
  ofertaVigente: OfferInfo | null
  retentionDays: number
  updatedAt: string
}

export interface TenantConfigState {
  config: TenantConfig | null
  loading: boolean
  error: string | null
  saving: boolean
}
