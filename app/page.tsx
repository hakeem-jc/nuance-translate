"use client";
import { useState } from "react";
import { ArrowLeft, Grid2X2, ArrowLeftRight, Mic, Copy } from "lucide-react";

const DIALECTS = [
  "Spanish (Spain)",
  "Spanish (Caribbean)",
  "Mexican Spanish",
  "Argentinian Spanish",
  "Colombian Spanish",
  "Jamaican Patois",
];

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

  function swapLanguages() {
    setFrom(to);
    setTo(from);
  }

  async function handleTranslate() {
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
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-primary ">
      <header className="text-center p-6 mb-4 shadow-sm w-full">
        <div className="flex items-center justify-between">
          <button
            className="h-12 w-12 rounded-full border border-black/10 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.08)] flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-black/80" />
          </button>

          <h1 className="text-[22px] font-semibold tracking-tight text-black/90">
            Nuance Translate
          </h1>

          <button
            className="h-12 w-12 rounded-full border border-black/10 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.08)] flex items-center justify-center"
            aria-label="Menu"
          >
            <Grid2X2 className="h-5 w-5 text-black/80" />
          </button>
        </div>
      </header>

      <form className="flex flex-col gap-4 w-11/12 mx-auto">
        <div className="mt-6 flex flex-col justify-between gap-3">
          <input
            className="rounded-[22px] border border-black/10 bg-white p-5"
            placeholder="From"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />

          <button
            className="h-12 w-12 rounded-full bg-black text-white shadow-[0_14px_30px_rgba(0,0,0,0.18)] flex items-center justify-center"
            aria-label="Swap"
            onClick={swapLanguages}
          >
            <ArrowLeftRight className="h-5 w-5" />
          </button>
          <input
            className="rounded-[22px] border border-black/10 bg-white p-5"
            placeholder="To"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
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
                  aria-label="Speak"
                >
                  <Copy className="h-5 w-5" />
                </button>
                <button
                  className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center"
                  aria-label="Mic"
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
            onChange={(e) => setText(e.target.value)}
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
                  aria-label="Speak"
                >
                  <Copy className="h-5 w-5" />
                </button>
                <button
                  className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center"
                  aria-label="Mic"
                >
                  <Mic className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}


        <div className="">
          <select
            className="rounded-lg border border-slate-700 p-2"
            value={dialect}
            onChange={(e) => setDialect(e.target.value)}
          >
            <option value="">Dialect (optional)</option>
            {DIALECTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            className="rounded-lg border border-slate-700 p-2"
            value={tone}
            onChange={(e) => setTone(e.target.value as any)}
          >
            <option value="">Tone (optional)</option>
            <option value="formal">Formal</option>
            <option value="informal">Informal</option>
          </select>

          <select
            className="rounded-lg border border-slate-700 p-2"
            value={plurality}
            onChange={(e) => setPlurality(e.target.value as any)}
          >
            <option value="">Plurality (optional)</option>
            <option value="singular">Singular</option>
            <option value="plural">Plural</option>
          </select>
        </div>

        <button
          onClick={handleTranslate}
          disabled={!text || loading}
          className="w-full rounded-lg bg-secondary text-white py-3 font-medium hover:bg-accent disabled:opacity-50"
        >
          {loading ? "Translating..." : "Translate"}
        </button>

      </form>
    </main>
  );
}
