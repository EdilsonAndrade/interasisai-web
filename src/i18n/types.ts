import type { LocaleCode } from "./config";

export interface LocaleMeta {
  readonly code: LocaleCode;
  readonly flag: string;
  readonly nativeName: string;
  readonly dir: "ltr" | "rtl";
}
