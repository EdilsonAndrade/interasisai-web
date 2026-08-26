"use client";

import { FollowUpTenantPicker } from "./FollowUpTenantPicker";
import { FollowUpQueue } from "./FollowUpQueue";

export function FollowUpQueuePageClient() {
  return <FollowUpTenantPicker>{tenantId => <FollowUpQueue tenantId={tenantId} />}</FollowUpTenantPicker>;
}
