export type Tone = "formal" | "informal";

export interface Options {
  dialect?: string;
  tone?: Tone;
  plurality?: "singular" | "plural";
  gender?: "unspecified" | "male" | "female" | "neutral";
  domain?: Domain;
}

export interface TranslateRequest {
  text: string;
  from: string;
  to: string;
  options?: Options;
}

export type Domain =
  | "general"
  | "legal"
  | "medical"
  | "financial"
  | "technical";

export type Prefs = {
  dialect?: string;
  tone?: "formal" | "informal" | "";
  plurality?: "singular" | "plural" | "";
  gender?: "unspecified" | "male" | "female" | "neutral";
  domain?: Domain;
};

export type HistoryItem = {
  id: string;
  createdAt: number;
  from: string;
  to: string;
  text: string;
  translation: string;
  options: Options
};
