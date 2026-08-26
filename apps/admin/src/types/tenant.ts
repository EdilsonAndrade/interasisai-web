export interface TenantConfig {
  id: string
  name: string
  google_calendar_id?: string
  allowed_domains?: string[]
  oferta_vigente_texto?: string | null
  oferta_vigente_validade?: string | null
  retention_days: number
  [key: string]: unknown  // Allow other fields from backend
}

export interface TenantConfigState {
  config: TenantConfig | null
  loading: boolean
  error: string | null
  saving: boolean
}
