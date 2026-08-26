import { z } from 'zod'

export const EditDraftSchema = z.object({
  draftMessage: z
    .string()
    .min(1, 'Rascunho não pode estar vazio')
    .max(1000, 'Rascunho muito longo'),
})

export const ApproveFollowUpSchema = z.object({
  queueId: z.string(),
  draftMessage: z.string(),
  tenantOferta: z.string().optional(),
})

export const UpdateTenantConfigSchema = z.object({
  ofertaVigente: z
    .object({
      text: z.string().min(1, 'Texto de oferta não pode estar vazio'),
      validUntil: z.string().datetime('Data inválida'),
    })
    .nullable(),
  retentionDays: z
    .number()
    .int('Deve ser um número inteiro')
    .positive('Deve ser maior que 0'),
})

export type EditDraftInput = z.infer<typeof EditDraftSchema>
export type ApproveFollowUpInput = z.infer<typeof ApproveFollowUpSchema>
export type UpdateTenantConfigInput = z.infer<typeof UpdateTenantConfigSchema>
