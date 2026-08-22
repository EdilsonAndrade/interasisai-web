// ============================================================================
// Widget distribution route — serves the pre-built widget bundle with the
// requested tenantId injected, so the client's installation snippet needs
// zero configuration of its own.
// See specs/016-embeddable-chat-widget/contracts/widget-loader-contract.md
// ============================================================================

import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getTenantById } from "@/services/pythonBackend";

const BUNDLE_PATH = path.join(process.cwd(), "public", "widget", "widget.bundle.js");

function escapeForScriptString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tenantId: string }> },
): Promise<NextResponse> {
  const { tenantId } = await params;
  const trimmedTenantId = tenantId?.trim();

  if (!trimmedTenantId) {
    return new NextResponse("", {
      status: 200,
      headers: { "Content-Type": "application/javascript; charset=utf-8" },
    });
  }

  let bundle: string;
  try {
    bundle = await readFile(BUNDLE_PATH, "utf8");
  } catch {
    return new NextResponse("", {
      status: 200,
      headers: { "Content-Type": "application/javascript; charset=utf-8" },
    });
  }

  const tenantResult = await getTenantById(trimmedTenantId);
  const tenantName = tenantResult.ok ? tenantResult.tenant.name : "";

  const script =
    `const __INTERASIS_TENANT_ID__ = "${escapeForScriptString(trimmedTenantId)}";\n` +
    `const __INTERASIS_TENANT_NAME__ = "${escapeForScriptString(tenantName)}";\n` +
    bundle;

  return new NextResponse(script, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
}
