"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Settings, ArrowLeftRight, Mic, Copy } from "lucide-react";
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

  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsWrapRef = useRef<HTMLDivElement | null>(null);

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

  // Close dropdown on outside click or Escape
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!settingsOpen) return;
      const el = settingsWrapRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setSettingsOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (!settingsOpen) return;
      if (e.key === "Escape") setSettingsOpen(false);
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [settingsOpen]);

  return (
    <main className="bg-(--background)">
      <header className="text-center p-6 mb-4 shadow-sm w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold tracking-tight text-black/90">
            Nuance Translate
          </h1>

          {/* Settings */}
          <div className="relative" ref={settingsWrapRef}>
            <button
              className="h-12 w-12 rounded-full border border-black/10 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.08)] flex items-center justify-center cursor-pointer"
              aria-label="Settings"
              type="button"
              onClick={() => setSettingsOpen((v) => !v)}
            >
              <Settings className="h-5 w-5 text-black/70 hover:text-black/95 transition-colors" />
            </button>

            {settingsOpen && (
              <div
                className="
                  absolute right-0 mt-3 w-70
                  rounded-[18px] border border-black/10 bg-white
                  shadow-[0_18px_50px_rgba(0,0,0,0.14)]
                  p-4 z-50
                "
                role="menu"
                aria-label="Translation settings"
              >
                <div className="space-y-3">
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
              </div>
            )}
          </div>
        </div>
      </header>

      <form className="flex flex-col gap-4 w-11/12 mx-auto max-w-6xl">
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

        <section className="mt-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="rounded-sm border border-black/10 bg-white">
            <textarea
              className="w-full h-48 mt-6 rounded-sm bg-white p-5 focus:outline-none"
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

          {/* Output */}
          <div className="rounded-sm border border-black/10 bg-white">
            <textarea
              className="w-full h-48 mt-6 rounded-sm bg-white p-5"
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
        </section>

        {error && <p className="text-sm text-red-400">{error}</p>}

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
