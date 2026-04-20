export const DIALECTS_BY_LANGUAGE: Record<string, string[]> = {
  English: ["US", "UK", "Caribbean"],
  Spanish: ["Spain", "Colombian", "Cuban", "Mexican", "Argentinian"],
  Portuguese: ["Portugal", "Brazil"],
};

export const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "Russian",
  "German",
  "Japanese",
  "Chinese",
  "Portuguese",
];

export const MAX_CHARS = 5000;
export const LS_PREFS_KEY = "nuance_translate_prefs_v1";
export const LS_HISTORY_KEY = "nuance_translate_history_v1";
export const HISTORY_LIMIT = 30;

export const LANG_CODE_MAP: Record<string, string> = {
  English: "en-US",
  Spanish: "es-ES",
  French: "fr-FR",
  German: "de-DE",
  Russian: "ru-RU",
  Chinese: "zh-CN",
  Portuguese: "pt-PT",
  Japanese: "ja-JP",
};

export function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function formatWithDots(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function getDialectOptions(language: string) {
  return DIALECTS_BY_LANGUAGE[language] ?? ["Standard"];
}