"use client";
import { useMemo, useState } from "react";
import { Grid2X2, ArrowLeftRight, Mic, Copy } from "lucide-react";
import Select from "@/components/Select";

const DIALECTS = [
  "Spanish (Spain)",
  "Spanish (Caribbean)",
  "Mexican Spanish",
  "Argentinian Spanish",
  "Colombian Spanish",
  "Jamaican Patois",
];

const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese"];

export default function TranslatorPage() {
  const [text, setText] = useState("");
  const [from, setFrom] = useState("English");
  const [to, setTo] = useState("Spanish");
  const [dialect, setDialect] = useState("");
  const [tone, setTone] = useState<"formal" | "informal" | "">("");
  const [plurality, setPlurality] = useState<"singular" | "plural" | "">("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const languageOptions = useMemo(
    () => LANGUAGES.map((l) => ({ value: l, label: l })),
    [],
  );

  const dialectOptions = useMemo(
    () => DIALECTS.map((d) => ({ value: d, label: d })),
    [],
  );

  const toneOptions = useMemo(
    () => [
      { value: "formal", label: "Formal" },
      { value: "informal", label: "Informal" },
    ],
    [],
  );

  const pluralityOptions = useMemo(
    () => [
      { value: "singular", label: "Singular" },
      { value: "plural", label: "Plural" },
    ],
    [],
  );

  function swapLanguages(e?: React.MouseEvent) {
    e?.preventDefault();
    setFrom(to);
    setTo(from);
  }

  async function handleTranslate(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          from,
          to,
          options: {
            dialect: dialect || undefined,
            tone: tone || undefined,
            plurality: plurality || undefined,
          },
        }),
      });

      if (!res.ok) throw new Error("Translation failed");

      const data = await res.json();
      setResult(data.translation);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-(--background)">
      <header className="text-center p-6 mb-4 shadow-sm w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold tracking-tight text-black/90">
            Nuance Translate
          </h1>

          <button
            className="h-12 w-12 rounded-full border border-black/10 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.08)] flex items-center justify-center"
            aria-label="Menu"
            type="button"
          >
            <Grid2X2 className="h-5 w-5 text-black/80" />
          </button>
        </div>
      </header>

      <form className="flex flex-col gap-4 w-11/12 mx-auto max-w-3xl">
        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 min-w-35 sm:min-w-45">
            <Select
              id="from"
              label="From"
              value={from}
              onChange={setFrom}
              options={languageOptions}
              placeholder="From"
            />
          </div>

          <button
            className="h-12 w-12 shrink-0 rounded-full bg-black text-white shadow-[0_14px_30px_rgba(0,0,0,0.18)] flex items-center justify-center"
            aria-label="Swap"
            onClick={swapLanguages}
            type="button"
          >
            <ArrowLeftRight className="h-5 w-5" />
          </button>

          <div className="flex-1 min-w-35 sm:min-w-45">
            <Select
              id="to"
              label="To"
              value={to}
              onChange={setTo}
              options={languageOptions}
              placeholder="To"
            />
          </div>
        </div>

        <div className="mt-6 rounded-[22px] border border-black/10 bg-white">
          <textarea
            className="w-full h-32 mt-6 rounded-sm bg-white p-5 focus:outline-none"
            placeholder="Enter text to translate"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <div className="p-5">
            <div className="mt-6 h-px w-full bg-black/10" />
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[12px] font-semibold text-black/85">
                150 <span className="font-normal text-black/45">/ 5.000</span>
              </span>

              <div className="flex items-center gap-3 text-black/70">
                <button
                  className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center"
                  aria-label="Copy"
                  type="button"
                >
                  <Copy className="h-5 w-5" />
                </button>
                <button
                  className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center"
                  aria-label="Mic"
                  type="button"
                >
                  <Mic className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[22px] border border-black/10 bg-white">
          <textarea
            className="w-full h-32 mt-6 rounded-sm bg-white p-5"
            value={result ?? ""}
            disabled
          />
          <div className="p-5">
            <div className="mt-6 h-px w-full bg-black/10" />

            <div className="mt-3 flex items-center justify-between">
              <span className="text-[12px] font-semibold text-black/85">
                150 <span className="font-normal text-black/45">/ 5.000</span>
              </span>

              <div className="flex items-center gap-3 text-black/70">
                <button
                  className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center"
                  aria-label="Copy"
                  type="button"
                >
                  <Copy className="h-5 w-5" />
                </button>
                <button
                  className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center"
                  aria-label="Mic"
                  type="button"
                >
                  <Mic className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            id="dialect"
            label="Dialect"
            value={dialect}
            onChange={setDialect}
            options={dialectOptions}
            placeholder="Optional"
          />

          <Select
            id="tone"
            label="Tone"
            value={tone}
            onChange={(v) => setTone(v as any)}
            options={toneOptions}
            placeholder="Optional"
          />

          <Select
            id="plurality"
            label="Plurality"
            value={plurality}
            onChange={(v) => setPlurality(v as any)}
            options={pluralityOptions}
            placeholder="Optional"
          />
        </div>

        <button
          onClick={handleTranslate}
          disabled={!text || loading}
          className="rounded-lg bg-(--foreground) text-white py-3 font-medium hover:bg-(--accent) disabled:opacity-50"
          type="button"
        >
          {loading ? "Translating..." : "Translate"}
        </button>
      </form>
    </main>
  );
}
