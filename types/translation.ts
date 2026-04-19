export type TranslationTone = "formal" | "informal";

export interface TranslationOptions {
  dialect?: string;
  tone?: TranslationTone;
  plurality?: "singular" | "plural";
  gender?: "unspecified" | "male" | "female" | "neutral";
  domain?: TranslationDomain;
}

export type TranslationDomain =
  | "general"
  | "legal"
  | "medical"
  | "financial"
  | "technical";

export interface TranslateRequest {
  text: string;
  from: string;
  to: string;
  options?: TranslationOptions;
}