export type TranslationTone = 'formal' | 'informal';

export interface TranslationOptions {
    dialect?: string;
    tone?: TranslationTone;
    plurality?: 'singular' | 'plural';
    gender?: "unspecified" | "male" | "female" | "neutral";
}

export interface TranslateRequest {
    text: string;
    from: string;
    to: string;
    options?: TranslationOptions;
}