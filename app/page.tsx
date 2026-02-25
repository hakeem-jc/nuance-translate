"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Settings, ArrowLeftRight, Mic, Copy, Volume2 } from "lucide-react";
import Select from "@/components/Select";
import { ToastContainer, toast } from 'react-toastify';

const DIALECTS = [
  "Spanish (Spain)",
  "Spanish (Caribbean)",
  "Mexican Spanish",
  "Argentinian Spanish",
  "Colombian Spanish",
  "Jamaican Patois",
];

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "Russian",
  "German",
  "Japanse",
  "Chinese",
  "Portuguese",
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

  async function copyToClipboard(value: string) {
    try {
      if (!value) return;
      await navigator.clipboard.writeText(value);
      toast.success("Copied!");
    } catch {
      toast.error("Something Went Wrong");
    }
  }

  function speakText(value: string, langLabel: string) {
    // Placeholder: uses Web Speech API if available
    // TODO: map your language labels to BCP-47 codes more accurately
    if (!value) return;
    if (typeof window === "undefined") return;

    const synth = window.speechSynthesis;
    if (!synth) {
      // TODO: toast "Speech not supported"
      toast.error("Speech not supported");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(value);

    const langMap: Record<string, string> = {
      English: "en-US",
      Spanish: "es-ES",
      French: "fr-FR",
      German: "de-DE",
      Russian: "ru-RU",
      Chinese: "zh-CN",
      Portuguese: "pt-PT",
      Japanse: "ja-JP",
    };
    utterance.lang = langMap[langLabel] ?? "en-US";

    synth.cancel(); // stop any previous speech
    synth.speak(utterance);
  }

  function startDictationPlaceholder() {
    // TODO: toast "Mic dictation not implemented yet"
    console.log("Mic placeholder: start dictation");
  }

  function swapLanguages(e?: React.MouseEvent) {
    e?.preventDefault();
    setFrom((prevFrom) => {
      setTo(prevFrom); 
      return to; 
    });

    setText((prevText) => {
      setResult(prevText);
      return result ?? "";
    });
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
      <header className="text-center p-4 mb-2 shadow-sm w-full">
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
        {/* Language Row */}
        <div className="mt-6 flex items-end gap-3">
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
            className="h-10 w-10 shrink-0 rounded-full bg-black text-white shadow-[0_14px_30px_rgba(0,0,0,0.18)] flex items-center justify-center mb-1.5"
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

        {/* Translation Fields */}
        <section className="mt-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="rounded-sm border border-black/10 bg-white">
            <textarea
              className="w-full mt-6 rounded-sm bg-white p-5 focus:outline-none resize-none"
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
                    className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
                    aria-label="Speaker"
                    type="button"
                    onClick={() => speakText(text, from)}
                  >
                    <Volume2 className="h-5 w-5" />
                  </button>
                  <button
                    className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
                    aria-label="Copy"
                    type="button"
                    onClick={() => copyToClipboard(text)}
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                  <button
                    className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
                    aria-label="Mic"
                    type="button"
                    onClick={startDictationPlaceholder}
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Output */}
          <div
            className={[
              "rounded-sm border border-black/10 bg-white",
              // Mobile: hide until result exists
              result ? "block" : "hidden",
              // Desktop (md+): always show
              "md:block",
            ].join(" ")}
          >
            <textarea
              className="w-full mt-6 rounded-sm bg-white p-5 resize-none"
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
                    className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
                    aria-label="Speaker"
                    type="button"
                    onClick={() => speakText(result ?? "", to)}
                    disabled={!result}
                  >
                    <Volume2 className="h-5 w-5" />
                  </button>
                  <button
                    className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
                    aria-label="Copy"
                    type="button"
                    onClick={() => copyToClipboard(result ?? "")}
                    disabled={!result}
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                  <button
                    className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
                    aria-label="Mic"
                    type="button"
                    onClick={startDictationPlaceholder}
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="text-center">
          <button
            onClick={handleTranslate}
            disabled={!text || loading}
            className="w-64 cursor-pointer text-center rounded-[22px] bg-(--foreground) text-white py-3 font-medium hover:bg-(--accent) disabled:opacity-50"
            type="button"
          >
            {loading ? "Translating..." : "Translate"}
          </button>

          {/* TODO - Replace this with a toast message */}
          {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        </div>
      </form>

      {/* Footer unchanged */}
      <footer className="mt-10 border-t border-black/10 bg-gray-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-10">
          <div className="md:flex md:justify-between md:gap-10">
            <div className="mb-8 md:mb-0 md:flex md:items-start md:gap-6">
              <a href="./" className="flex justify-center md:justify-start">
                <img src="./logo.png" className="h-14" alt="Nuance Logo" />
              </a>

              <p className="mt-4 md:mt-1 text-sm text-gray-600 max-w-sm text-center md:text-left">
                Nuance Translate provides AI powered translations and helps you
                fine-tune tone, plurality, and dialect for more precise
                translations.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <h2 className="mb-4 text-xs font-semibold tracking-wider text-gray-900 uppercase">
                  Follow Me
                </h2>
                <ul className="text-sm text-gray-600 font-medium space-y-3">
                  <li>
                    <a
                      href="https://github.com/hakeem-jc"
                      className="hover:text-gray-900 hover:underline"
                    >
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.linkedin.com/in/hakeemclarke/"
                      className="hover:text-gray-900 hover:underline"
                    >
                      LinkedIn
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="mb-4 text-xs font-semibold tracking-wider text-gray-900 uppercase">
                  Legal
                </h2>
                <ul className="text-sm text-gray-600 font-medium space-y-3">
                  <li>
                    <a
                      href="/tos"
                      className="hover:text-gray-900 hover:underline"
                    >
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-black/10 pt-6 sm:flex sm:items-center sm:justify-between text-center">
            <span className="text-sm text-gray-600">
              © {new Date().getFullYear()}{" "}
              <a
                href="https://www.hakeemclarke.com/"
                className="font-medium text-gray-900 hover:underline"
              >
                Hakeem Clarke
              </a>
              . All Rights Reserved.
            </span>

            <div className="mt-4 flex items-center justify-center gap-5 sm:justify-end sm:mt-0">
              <a
                href="https://www.linkedin.com/in/hakeemclarke/"
                className="text-gray-500 hover:text-gray-900 transition-colors"
                aria-label="LinkedIn"
              >
                <svg
                  className="h-5 w-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.039-1.85-3.039-1.853 0-2.136 1.446-2.136 2.939v5.669H9.353V9h3.414v1.561h.049c.476-.9 1.636-1.85 3.367-1.85 3.599 0 4.264 2.368 4.264 5.455v6.286zM5.337 7.433a2.063 2.063 0 1 1 0-4.126 2.063 2.063 0 0 1 0 4.126zM7.117 20.452H3.558V9h3.559v11.452zM22.225 0H1.771C.792 0 0 .771 0 1.723v20.554C0 23.229.792 24 1.771 24h20.451C23.2 24 24 23.229 24 22.277V1.723C24 .771 23.2 0 22.225 0z" />
                </svg>
              </a>

              <a
                href="https://github.com/hakeem-jc"
                className="text-gray-500 hover:text-gray-900 transition-colors"
                aria-label="GitHub"
              >
                <svg
                  className="h-5 w-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>

              <a
                href="https://dribbble.com/HakeemC"
                className="text-gray-500 hover:text-gray-900 transition-colors"
                aria-label="Dribbble"
              >
                <svg
                  className="h-5 w-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 0a10 10 0 1 0 10 10A10.009 10.009 0 0 0 10 0Zm6.613 4.614a8.523 8.523 0 0 1 1.93 5.32 20.094 20.094 0 0 0-5.949-.274c-.059-.149-.122-.292-.184-.441a23.879 23.879 0 0 0-.566-1.239 11.41 11.41 0 0 0 4.769-3.366ZM8 1.707a8.821 8.821 0 0 1 2-.238 8.5 8.5 0 0 1 5.664 2.152 9.608 9.608 0 0 1-4.476 3.087A45.758 45.758 0 0 0 8 1.707ZM1.642 8.262a8.57 8.57 0 0 1 4.73-5.981A53.998 53.998 0 0 1 9.54 7.222a32.078 32.078 0 0 1-7.9 1.04h.002Zm2.01 7.46a8.51 8.51 0 0 1-2.2-5.707v-.262a31.64 31.64 0 0 0 8.777-1.219c.243.477.477.964.692 1.449-.114.032-.227.067-.336.1a13.569 13.569 0 0 0-6.942 5.636l.009.003ZM10 18.556a8.508 8.508 0 0 1-5.243-1.8 11.717 11.717 0 0 1 6.7-5.332.509.509 0 0 1 .055-.02 35.65 35.65 0 0 1 1.819 6.476 8.476 8.476 0 0 1-3.331.676Zm4.772-1.462A37.232 37.232 0 0 0 13.113 11a12.513 12.513 0 0 1 5.321.364 8.56 8.56 0 0 1-3.66 5.73h-.002Z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
      <ToastContainer position="bottom-right" />
    </main>
  );
}