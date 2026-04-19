import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { TranslateRequest } from "@/types/translation";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  if (options?.dialect) {
    instructions.push(`Use the ${options.dialect} dialect.`);
  }

  if (options?.tone) {
    instructions.push(`The tone should be ${options.tone}.`);
  }

  if (options?.plurality) {
    instructions.push(`Ensure the translation is ${options.plurality}.`);
  }

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

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TranslateRequest;

    if (!body.text || !body.from || !body.to) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const prompt = buildTranslationPrompt(body);

    const response = await openai.chat.completions.create({
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
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    let translation = response.choices[0]?.message?.content ?? "";
    if (translation) {
      translation = translation.trim().replace(/^["'“”]+|["'“”]+$/g, "");
    }

    return NextResponse.json({ translation });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}