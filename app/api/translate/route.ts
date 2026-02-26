import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { TranslateRequest } from "@/types/translation";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildTranslationPrompt({ text, from, to, options }: TranslateRequest) {
  const instructions: string[] = [];

  instructions.push(`Translate the following text from ${from} to ${to}.`);

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
      `Where applicable, use ${options.gender} gendered language (e.g., pronouns/titles) in the translation.`
    );
  }

  instructions.push(
    "Preserve meaning and cultural nuance. Do not explain the translation."
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
        { status: 400 }
      );
    }

    const prompt = buildTranslationPrompt(body);

    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages: [
        {
          role: "system",
          content:
            "You are a professional human translator who preserves meaning, tone, and cultural nuance.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content ?? "";
    const translation = content.replace(/['"]/g, "");

    return NextResponse.json({ translation });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}