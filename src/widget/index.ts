// ============================================================================
// Widget Entry Point — loaded by the browser via the script tag generated
// from the tenant's installation snippet. See
// specs/016-embeddable-chat-widget/contracts/widget-loader-contract.md
// ============================================================================

import { initSession } from "./state";
import { mountWidget } from "./render";

declare const __INTERASIS_TENANT_ID__: string;

async function bootstrap(): Promise<void> {
  const tenantId =
    typeof __INTERASIS_TENANT_ID__ === "string" ? __INTERASIS_TENANT_ID__.trim() : "";
  if (!tenantId) return;

  const ok = await initSession(tenantId);
  // Any failure (domain not authorized, tenant deleted/inexistent, network
  // error) — render nothing, throw nothing visible to the host page.
  // Per FR-004 / contracts/widget-loader-contract.md.
  if (!ok) return;

  mountWidget();
}

void bootstrap();
