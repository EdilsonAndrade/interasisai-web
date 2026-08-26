import { z } from "zod";

export const tenantUsageSchema = z.object({
  tenant_id: z.string(),
  monthly_message_limit: z.number().int().positive().nullable(),
  current_month_calls: z.number().int().nonnegative(),
  percentage_used: z.number().min(0).max(100).nullable(),
  blocked: z.boolean(),
});

export const tenantMessageLimitConfigSchema = z.object({
  worst_case_calls_per_message: z.number().positive(),
  average_calls_per_message: z.number().positive(),
});

export type TenantUsageParsed = z.infer<typeof tenantUsageSchema>;
export type TenantMessageLimitConfigParsed = z.infer<typeof tenantMessageLimitConfigSchema>;
