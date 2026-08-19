// ============================================================================
// Build script for the standalone embeddable chat widget (src/widget/).
// Produces public/widget/widget.bundle.js, consumed at request-time by
// src/app/widget/[tenantId]/route.ts.
// See specs/016-embeddable-chat-widget/research.md #2 and #5.
// ============================================================================

import { build } from "esbuild";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

/** Minimal .env loader — Next.js loads .env* automatically, plain Node scripts don't. */
function loadEnvFile(fileName) {
  const filePath = path.join(rootDir, fileName);
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

// Same precedence Next.js uses: .env.local overrides .env
loadEnvFile(".env");
loadEnvFile(".env.local");

const pythonBackendUrl = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL ?? "";

if (!pythonBackendUrl) {
  console.warn(
    "[build-widget] AVISO: NEXT_PUBLIC_PYTHON_BACKEND_URL não definida — o bundle será gerado, mas o widget falhará ao inicializar em runtime.",
  );
}

await build({
  entryPoints: [path.join(rootDir, "src/widget/index.ts")],
  outfile: path.join(rootDir, "public/widget/widget.bundle.js"),
  bundle: true,
  minify: true,
  format: "iife",
  platform: "browser",
  target: ["es2017"],
  tsconfig: path.join(rootDir, "tsconfig.json"),
  define: {
    "process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL": JSON.stringify(pythonBackendUrl),
  },
});

console.info("[build-widget] public/widget/widget.bundle.js gerado com sucesso.");
