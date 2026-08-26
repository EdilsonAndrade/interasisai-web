import { z } from "zod";

export const EditDraftSchema = z.object({
  draftMessage: z.string().min(1, "Rascunho não pode estar vazio").max(1000, "Rascunho muito longo"),
});

export const UpdateFollowUpTenantConfigSchema = z
  .object({
    oferta_vigente_texto: z.string().trim().min(1, "Texto de oferta não pode estar vazio").nullable(),
    oferta_vigente_validade: z.string().min(1, "Data de validade é obrigatória").nullable(),
    retention_days: z.number().int("Deve ser um número inteiro").positive("Deve ser maior que 0"),
  })
  .refine(
    data => {
      if (!data.oferta_vigente_validade) return true;
      const validade = new Date(data.oferta_vigente_validade);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return validade >= today;
    },
    { message: "Data de validade não pode estar no passado", path: ["oferta_vigente_validade"] }
  )
  .refine(data => !data.oferta_vigente_texto || !!data.oferta_vigente_validade, {
    message: "Informe a data de validade quando houver texto de oferta",
    path: ["oferta_vigente_validade"],
  });

export type EditDraftInput = z.infer<typeof EditDraftSchema>;
export type UpdateFollowUpTenantConfigInput = z.infer<typeof UpdateFollowUpTenantConfigSchema>;
