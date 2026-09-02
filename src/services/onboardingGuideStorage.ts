// ============================================================================
// Onboarding Guide Storage — persistence for the tenant onboarding guide
// Stores the "guide disabled" flag and per-tenant checklist progress in
// localStorage. Falls back to in-memory storage when localStorage is
// unavailable (private browsing, quota exceeded, etc.) — mirrors the
// established pattern in sessionManager.ts. Never throws.
// ============================================================================

import { ONBOARDING_STEP_IDS, type OnboardingStepId } from "./onboardingGuideStorage.types";

const DISABLED_KEY = "onboarding_guide_disabled";
const PROGRESS_KEY_PREFIX = "onboarding_guide_progress:";
const ACTIVE_TENANT_KEY = "onboarding_guide_active_tenant";
const MINIMIZED_KEY = "onboarding_guide_minimized";

/** In-memory fallback storage when localStorage is unavailable */
const memoryStore = new Map<string, string>();

function isLocalStorageAvailable(): boolean {
  try {
    const key = "__onboarding_guide_test__";
    localStorage.setItem(key, key);
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function readRaw(key: string): string | null {
  if (!isLocalStorageAvailable()) {
    return memoryStore.get(key) ?? null;
  }
  try {
    return localStorage.getItem(key);
  } catch {
    return memoryStore.get(key) ?? null;
  }
}

function writeRaw(key: string, value: string): void {
  if (isLocalStorageAvailable()) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // QuotaExceededError — fall back to memory only
    }
  }
  memoryStore.set(key, value);
}

function removeRaw(key: string): void {
  if (isLocalStorageAvailable()) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore — memory fallback below still clears
    }
  }
  memoryStore.delete(key);
}

function progressKey(tenantId: string): string {
  return `${PROGRESS_KEY_PREFIX}${tenantId}`;
}

function isOnboardingStepId(value: unknown): value is OnboardingStepId {
  return typeof value === "string" && (ONBOARDING_STEP_IDS as string[]).includes(value);
}

/**
 * Whether the user has disabled the guide. Never throws.
 * Absence of the flag (or any corrupted value) means the guide is enabled.
 */
export function readGuideDisabled(): boolean {
  return readRaw(DISABLED_KEY) === "true";
}

export function writeGuideDisabled(disabled: boolean): void {
  if (disabled) {
    writeRaw(DISABLED_KEY, "true");
  } else {
    removeRaw(DISABLED_KEY);
  }
}

/**
 * Steps already marked complete for a tenant. Never throws.
 * Returns an empty list when nothing was saved or the saved value is corrupted.
 */
export function readProgress(tenantId: string): OnboardingStepId[] {
  const raw = readRaw(progressKey(tenantId));
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isOnboardingStepId);
  } catch {
    return [];
  }
}

export function writeProgress(tenantId: string, steps: OnboardingStepId[]): void {
  writeRaw(progressKey(tenantId), JSON.stringify(steps));
}

/**
 * Tenant the floating guide currently refers to. Persisted so the icon
 * survives a page refresh or navigating between admin pages. Never throws.
 */
export function readActiveTenantId(): string | null {
  return readRaw(ACTIVE_TENANT_KEY);
}

export function writeActiveTenantId(tenantId: string | null): void {
  if (tenantId) {
    writeRaw(ACTIVE_TENANT_KEY, tenantId);
  } else {
    removeRaw(ACTIVE_TENANT_KEY);
  }
}

/**
 * Whether the guide is collapsed to the floating icon. Persisted so a
 * refresh doesn't unexpectedly re-expand (or re-collapse) the panel.
 * Defaults to minimized (icon-only) when nothing was saved yet, so the
 * icon shows up unobtrusively on first load instead of popping the full
 * checklist open with no tenant context.
 */
export function readGuideMinimized(): boolean {
  const raw = readRaw(MINIMIZED_KEY);
  return raw === null ? true : raw === "true";
}

export function writeGuideMinimized(minimized: boolean): void {
  writeRaw(MINIMIZED_KEY, minimized ? "true" : "false");
}
