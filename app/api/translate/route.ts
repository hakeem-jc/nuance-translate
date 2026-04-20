import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { TranslateRequest } from "@/types/translation";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Synonyms are only meaningful for short inputs (single word or brief phrase)
const SYNONYM_WORD_LIMIT = 5;

function shouldFetchSynonyms(text: string): boolean {
  return text.trim().split(/\s+/).length <= SYNONYM_WORD_LIMIT;
}

function buildTranslationPrompt({ text, from, to, options }: TranslateRequest) {
  const instructions: string[] = [];

  instructions.push(`Translate the following text from ${from} to ${to}.`);

  if (options?.domain && options.domain !== "general") {
    instructions.push(
      `This is a ${options.domain} translation. Use precise, domain-specific terminology and formal register appropriate for ${options.domain} documents.`,
    );

    if (options.domain === "legal") {
      instructions.push(
        "Preserve legal meaning exactly. Use standard legal phrasing used in contracts, statutes, or formal proceedings. Avoid simplification.",
      );
    }
    if (options.domain === "medical") {
      instructions.push(
        "Use clinically accurate terminology. Avoid ambiguity. Follow standard medical naming conventions.",
      );
    }
    if (options.domain === "financial") {
      instructions.push(
        "Use correct financial and accounting terminology. Maintain formal and precise language.",
      );
    }
    if (options.domain === "technical") {
      instructions.push(
        "Use precise technical terminology. Prefer industry-standard terms over literal translations.",
      );
    }
  }

  if (options?.dialect)
    instructions.push(`Use the ${options.dialect} dialect.`);
  if (options?.tone) instructions.push(`The tone should be ${options.tone}.`);
  if (options?.plurality)
    instructions.push(`Ensure the translation is ${options.plurality}.`);
  if (options?.gender && options.gender !== "unspecified") {
    instructions.push(
      `Where applicable, use ${options.gender} gendered language.`,
    );
  }

  instructions.push(
    "Preserve meaning exactly. Maintain formatting if present. Do not summarize or simplify. Do not explain. Output only the translated text.",
  );

  return `
${instructions.join(" ")}

Text:
"""${text}"""
`;
}

function buildSynonymPrompt({
  text,
  from,
  to,
  options,
}: TranslateRequest): string {
  const dialectNote = options?.dialect ? ` (${options.dialect} dialect)` : "";
  const domainNote =
    options?.domain && options.domain !== "general"
      ? ` in a ${options.domain} context`
      : "";

  return `
            You are a bilingual lexicographer. The user is translating a short word or phrase from ${from} to ${to}${dialectNote}${domainNote}.

            For each meaningful word in the translation, provide up to 4 synonym or alternative translations in ${to} that preserve a similar meaning. Focus on variety: include formal, informal, or regional alternatives where they exist.

            Respond ONLY with a valid JSON array. No prose, no markdown, no code fences.

            Schema:
            [
              { "word": "<translated word or phrase>", "synonyms": ["alt1", "alt2", "alt3"] }
            ]

            The input to translate is:
            """${text.trim()}"""
          `;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TranslateRequest;

    if (!body.text || !body.from || !body.to) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const translationPromise = openai.chat.completions.create({
      model: "gpt-5.2",
      messages: [
        {
          role: "system",
          content: `
            You are a professional translator who preserves meaning, tone, and cultural nuance. You also have expertise in legal, medical, financial, and technical domains.

            Rules:
            - Always use domain-appropriate terminology when specified.
            - Prefer established terminology over literal translation.
            - Preserve the exact meaning, including obligations, conditions, and nuance.
            - Maintain formal register for legal/financial content.
            - Do not explain or paraphrase.
            - Output only the translated text.
          `,
        },
        { role: "user", content: buildTranslationPrompt(body) },
      ],
      temperature: 0.3,
    });

    // Run synonym fetch in parallel only when input is short enough
    const synonymPromise = shouldFetchSynonyms(body.text)
      ? openai.chat.completions.create({
          model: "gpt-5.2",
          messages: [{ role: "user", content: buildSynonymPrompt(body) }],
          temperature: 0.5,
        })
      : Promise.resolve(null);

    const [translationResponse, synonymResponse] = await Promise.all([
      translationPromise,
      synonymPromise,
    ]);

    let translation = translationResponse.choices[0]?.message?.content ?? "";
    if (translation) {
      translation = translation.trim().replace(/^["'""]+|["'""]+$/g, "");
    }

    let synonyms: { word: string; synonyms: string[] }[] | undefined;

    if (synonymResponse) {
      const raw = synonymResponse.choices[0]?.message?.content ?? "";
      try {
        const cleaned = raw
          .trim()
          .replace(/^```(?:json)?|```$/gm, "")
          .trim()
          .replace(/^[\"'“”«»]+|[\"'“”«»]+$/g, "");
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) {
          synonyms = parsed;
        }
      } catch {
        // Synonym parse failed — return translation without synonyms
      }
    }

    return NextResponse.json({ translation, synonyms });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
