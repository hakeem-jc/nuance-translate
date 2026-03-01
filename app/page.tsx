"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Settings,
  ArrowLeftRight,
  Mic,
  Copy,
  Volume2,
  Square,
  History,
  Trash2,
  CircleX,
} from "lucide-react";
import Select from "@/components/Select";
import { ToastContainer, toast } from "react-toastify";
import Image from "next/image";

const DIALECTS_BY_LANGUAGE: Record<string, string[]> = {
  English: ["US", "UK", "Caribbean"],
  Spanish: ["Spain", "Colombian", "Cuban", "Mexican", "Argentinian"],
  Portuguese: ["Portugal", "Brazil"],
};

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "Russian",
  "German",
  "Japanese",
  "Chinese",
  "Portuguese",
];

const MAX_CHARS = 5000;

const LS_PREFS_KEY = "nuance_translate_prefs_v1";
const LS_HISTORY_KEY = "nuance_translate_history_v1";
const HISTORY_LIMIT = 30;

type Prefs = {
  dialect?: string;
  tone?: "formal" | "informal" | "";
  plurality?: "singular" | "plural" | "";
  gender?: "unspecified" | "male" | "female" | "neutral";
};

type HistoryItem = {
  id: string;
  createdAt: number;
  from: string;
  to: string;
  text: string;
  translation: string;
  options: {
    dialect?: string;
    tone?: string;
    plurality?: string;
    gender?: string;
  };
};

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function formatWithDots(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getDialectOptions(language: string) {
  return DIALECTS_BY_LANGUAGE[language] ?? ["Standard"];
}

export default function TranslatorPage() {
  const [text, setText] = useState("");
  const [from, setFrom] = useState("English");
  const [to, setTo] = useState("Spanish");
  const [dialect, setDialect] = useState("Standard");
  const [tone, setTone] = useState<"formal" | "informal" | "">("");
  const [plurality, setPlurality] = useState<"singular" | "plural" | "">("");
  const [gender, setGender] = useState<
    "unspecified" | "male" | "female" | "neutral"
  >("unspecified");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsWrapRef = useRef<HTMLDivElement | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const historyWrapRef = useRef<HTMLDivElement | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [speaking, setSpeaking] = useState<"input" | "output" | null>(null);

  // Speech-to-text state
  const [listening, setListening] = useState<"input" | null>(null);
  const recognitionRef = useRef<any>(null);
  const dictationBaseRef = useRef<string>("");

  const formRef = useRef<HTMLFormElement | null>(null);

  const languageOptions = useMemo(
    () => LANGUAGES.map((l) => ({ value: l, label: l })),
    [],
  );

  const dialectOptions = useMemo(
    () => getDialectOptions(to).map((d) => ({ value: d, label: d })),
    [to],
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

  const genderOptions = useMemo(
    () => [
      { value: "unspecified", label: "Unspecified" },
      { value: "male", label: "Male" },
      { value: "female", label: "Female" },
      { value: "neutral", label: "Neutral" },
    ],
    [],
  );

  // Load prefs + history once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedPrefs = safeJsonParse<Prefs>(
      window.localStorage.getItem(LS_PREFS_KEY),
    );
    if (savedPrefs) {
      if (savedPrefs.dialect) setDialect(savedPrefs.dialect);
      if (savedPrefs.tone !== undefined) setTone(savedPrefs.tone);
      if (savedPrefs.plurality !== undefined)
        setPlurality(savedPrefs.plurality);
      if (savedPrefs.gender) setGender(savedPrefs.gender);
    }

    const savedHistory = safeJsonParse<HistoryItem[]>(
      window.localStorage.getItem(LS_HISTORY_KEY),
    );
    if (Array.isArray(savedHistory)) setHistory(savedHistory);
  }, []);

  // Persist prefs whenever they change
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefs: Prefs = { dialect, tone, plurality, gender };
    window.localStorage.setItem(LS_PREFS_KEY, JSON.stringify(prefs));
  }, [dialect, tone, plurality, gender]);

  // Persist history whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  // Keep dialect valid for selected "to" language
  useEffect(() => {
    const allowed = getDialectOptions(to);
    if (!allowed.includes(dialect)) setDialect("Standard");
    if (!dialect) setDialect("Standard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to]);

  const inputCount = text.length;
  const outputCount = (result ?? "").length;

  async function copyToClipboard(value: string) {
    try {
      if (!value) return;
      await navigator.clipboard.writeText(value);
      toast.success("Copied!");
    } catch {
      toast.error("Something Went Wrong");
    }
  }

  // ---- Text-to-speech ----
  function cancelSpeech() {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    setSpeaking(null);
  }

  function speakText(
    value: string,
    langLabel: string,
    which: "input" | "output",
  ) {
    if (!value) return;
    if (typeof window === "undefined") return;

    const synth = window.speechSynthesis;
    if (!synth) {
      toast.error("Speech not supported");
      return;
    }

    if (speaking === which) {
      cancelSpeech();
      return;
    }

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(value);

    const langMap: Record<string, string> = {
      English: "en-US",
      Spanish: "es-ES",
      French: "fr-FR",
      German: "de-DE",
      Russian: "ru-RU",
      Chinese: "zh-CN",
      Portuguese: "pt-PT",
      Japanese: "ja-JP",
    };
    utterance.lang = langMap[langLabel] ?? "en-US";

    utterance.onstart = () => setSpeaking(which);
    utterance.onend = () => setSpeaking(null);
    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
      setSpeaking(null);

      const err = (e.error || "").toLowerCase();
      if (err === "canceled" || err === "interrupted") return;

      toast.error("Speech failed");
    };

    synth.speak(utterance);
  }

  // ---- Speech-to-text (Web Speech API) ----
  function getRecognitionLang(langLabel: string) {
    const langMap: Record<string, string> = {
      English: "en-US",
      Spanish: "es-ES",
      French: "fr-FR",
      German: "de-DE",
      Russian: "ru-RU",
      Chinese: "zh-CN",
      Portuguese: "pt-PT",
      Japanese: "ja-JP",
    };
    return langMap[langLabel] ?? "en-US";
  }

  function stopDictation() {
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.onresult = null;
        rec.onend = null;
        rec.onerror = null;
        rec.stop();
      } catch {
        // ignore
      }
    }
    recognitionRef.current = null;
    setListening(null);
  }

  function toggleDictationInput() {
    if (typeof window === "undefined") return;

    if (listening === "input") {
      stopDictation();
      return;
    }

    // avoid clashes
    cancelSpeech();

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech-to-text not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = getRecognitionLang(from);
    recognition.interimResults = true;
    recognition.continuous = true;

    // Capture current textarea once at start (prevents duplicate appends)
    dictationBaseRef.current = text;

    recognition.onresult = (event: any) => {
      // Build the transcript from ALL results so far (final + interim)
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      const base = dictationBaseRef.current?.trim() ?? "";
      const combined = `${base}${base ? " " : ""}${transcript.trim()}`.trim();

      if (combined.length > MAX_CHARS) {
        toast.error("Input exceeds maximum length");
        stopDictation();
        return;
      }

      setText(combined);
    };

    recognition.onerror = (e: any) => {
      setListening(null);

      const err = (e?.error || "").toLowerCase();
      if (err === "no-speech") return;
      if (err === "not-allowed" || err === "service-not-allowed") {
        toast.error("Microphone permission denied");
        return;
      }
      toast.error("Dictation failed");
    };

    recognition.onend = () => {
      setListening(null);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
      setListening("input");
    } catch {
      toast.error("Could not start dictation");
      setListening(null);
    }
  }

  function clearInput() {
    cancelSpeech();
    stopDictation();
    setText("");
    setResult(null);
    setError(null);
  }

  function swapLanguages(e?: React.MouseEvent) {
    e?.preventDefault();
    cancelSpeech();
    stopDictation();

    setFrom((prevFrom) => {
      setTo(prevFrom);
      return to;
    });

    setText((prevText) => {
      setResult(prevText);
      return result ?? "";
    });
  }

  function submitOnEnter(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      (e.currentTarget as HTMLTextAreaElement).blur();
      formRef.current?.requestSubmit();
    }
  }

  function addToHistory(next: Omit<HistoryItem, "id">) {
    setHistory((prev) => {
      const item: HistoryItem = {
        ...next,
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      };

      const filtered = prev.filter(
        (h) =>
          !(
            h.from === item.from &&
            h.to === item.to &&
            h.text === item.text &&
            h.translation === item.translation
          ),
      );

      return [item, ...filtered].slice(0, HISTORY_LIMIT);
    });
  }

  function clearHistory() {
    setHistory([]);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LS_HISTORY_KEY);
    }
  }

  async function handleTranslate(overrideText?: string) {
    const textToTranslate = (overrideText ?? text).trim();
    if (!textToTranslate) return;

    if (textToTranslate.length > MAX_CHARS) {
      toast.error(`Max ${formatWithDots(MAX_CHARS)} characters`);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const options = {
      dialect: dialect || undefined,
      tone: tone || undefined,
      plurality: plurality || undefined,
      gender: gender || undefined,
    };

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToTranslate,
          from,
          to,
          options,
        }),
      });

      if (!res.ok) throw new Error("Translation failed");

      const data = await res.json();
      setResult(data.translation);

      addToHistory({
        createdAt: Date.now(),
        from,
        to,
        text: textToTranslate,
        translation: data.translation,
        options,
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;

      if (settingsOpen) {
        const el = settingsWrapRef.current;
        if (el && !el.contains(target)) setSettingsOpen(false);
      }

      if (historyOpen) {
        const el = historyWrapRef.current;
        if (el && !el.contains(target)) setHistoryOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (settingsOpen) setSettingsOpen(false);
      if (historyOpen) setHistoryOpen(false);
      if (listening) stopDictation();
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [settingsOpen, historyOpen, listening]);

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const next = e.target.value;
    if (next.length > MAX_CHARS) {
      toast.error("Input exceeds maximum length");
      return;
    }
    setText(next);
  }

  function handleInputPaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const pasted = e.clipboardData?.getData("text") ?? "";
    if (!pasted) return;

    e.preventDefault();

    const el = e.currentTarget;
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;

    const next = (text.slice(0, start) + pasted + text.slice(end)).slice(
      0,
      MAX_CHARS,
    );

    if (next.length > MAX_CHARS) {
      toast.error("Input exceeds maximum length");
      return;
    }

    cancelSpeech();
    stopDictation();

    setText(next);
    setResult(null);
    setError(null);

    handleTranslate(next);
  }

  // Cleanup: stop speech + dictation on unmount
  useEffect(() => {
    return () => {
      cancelSpeech();
      stopDictation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="bg-(--background)">
      <header className="text-center p-4 mb-2 shadow-sm w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold tracking-tight text-black/90">
            Nuance Translate
          </h1>

          <div className="flex items-center gap-2">
            {/* History */}
            <div className="relative" ref={historyWrapRef}>
              <button
                className="h-12 w-12 rounded-full border border-black/10 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.08)] flex items-center justify-center cursor-pointer"
                aria-label="Translation history"
                type="button"
                onClick={() => {
                  setHistoryOpen((v) => !v);
                  setSettingsOpen(false);
                }}
              >
                <History className="h-5 w-5 text-black/70 hover:text-black/95 transition-colors" />
              </button>

              {historyOpen && (
                <div
                  className="
                    absolute right-0 mt-3 w-90 sm:w-105
                    rounded-[18px] border border-black/10 bg-white
                    shadow-[0_18px_50px_rgba(0,0,0,0.14)]
                    p-4 z-50
                  "
                  role="menu"
                  aria-label="Translation history"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-black/85">
                      History
                    </p>

                    <button
                      type="button"
                      onClick={clearHistory}
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-semibold text-black/70 hover:bg-black/5"
                      disabled={history.length === 0}
                      title="Clear history"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear
                    </button>
                  </div>

                  {history.length === 0 ? (
                    <p className="text-sm text-black/55">
                      No translations yet.
                    </p>
                  ) : (
                    <ul className="max-h-95 overflow-auto pr-1 space-y-3">
                      {history.map((h) => (
                        <li
                          key={h.id}
                          className="rounded-xl border border-black/10 p-3 hover:bg-black/2"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[12px] font-semibold text-black/80">
                              {h.from} → {h.to}
                            </p>
                            <p className="text-[11px] text-black/45">
                              {new Date(h.createdAt).toLocaleString()}
                            </p>
                          </div>

                          <div className="mt-2 grid grid-cols-1 gap-2">
                            <div>
                              <p className="text-[11px] font-semibold text-black/60">
                                Input
                              </p>
                              <p className="text-[12px] text-black/75 line-clamp-3">
                                {h.text}
                              </p>
                            </div>

                            <div>
                              <p className="text-[11px] font-semibold text-black/60">
                                Output
                              </p>
                              <p className="text-[12px] text-black/75 line-clamp-3">
                                {h.translation}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 flex items-center gap-2">
                            <button
                              type="button"
                              className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-black/70 hover:bg-black/5"
                              onClick={() => {
                                cancelSpeech();
                                stopDictation();
                                setFrom(h.from);
                                setTo(h.to);
                                setText(h.text);
                                setResult(h.translation);

                                if (h.options.dialect)
                                  setDialect(h.options.dialect);
                                if (h.options.tone)
                                  setTone(h.options.tone as any);
                                if (h.options.plurality)
                                  setPlurality(h.options.plurality as any);
                                if (h.options.gender)
                                  setGender(h.options.gender as any);

                                setHistoryOpen(false);
                              }}
                            >
                              Load
                            </button>

                            <button
                              type="button"
                              className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-black/70 hover:bg-black/5"
                              onClick={() => copyToClipboard(h.translation)}
                            >
                              Copy output
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="relative" ref={settingsWrapRef}>
              <button
                className="h-12 w-12 rounded-full border border-black/10 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.08)] flex items-center justify-center cursor-pointer"
                aria-label="Settings"
                type="button"
                onClick={() => {
                  setSettingsOpen((v) => !v);
                  setHistoryOpen(false);
                }}
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

                    <Select
                      id="gender"
                      label="Gender"
                      value={gender}
                      onChange={(v) => setGender(v as any)}
                      options={genderOptions}
                      placeholder="Optional"
                    />

                    <div className="pt-2">
                      <button
                        type="button"
            className="w-full cursor-pointer text-center rounded-3xl bg-(--foreground) text-white py-2 font-medium hover:bg-(--accent)"

                        // className="w-full cursor-pointer rounded-3xl bg-(--foreground) text-white py-3  border border-black/10  text-[12px] font-semibold hover:bg-black/5"
                        onClick={() => {
                          if (typeof window !== "undefined") {
                            window.localStorage.removeItem(LS_PREFS_KEY);
                          }
                          setDialect("Standard");
                          setTone("");
                          setPlurality("");
                          setGender("unspecified");
                          toast.success("Preferences reset");
                        }}
                      >
                        Reset preferences
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <form
        ref={formRef}
        className="flex flex-col gap-4 w-11/12 mx-auto max-w-6xl"
        onSubmit={(e) => {
          e.preventDefault();
          handleTranslate();
        }}
      >
        <section className="order-1 sm:order-2 mt-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Input */}
          <div className="rounded-sm border border-black/10 bg-white">
            <textarea
              className="w-full mt-4 rounded-sm bg-white p-5 focus:outline-none resize-none"
              placeholder="Enter text to translate"
              value={text}
              onKeyDown={submitOnEnter}
              onPaste={handleInputPaste}
              onChange={handleInputChange}
            />

            <div className="p-4 pt-0 sm:p-5">
              <div className="mt-4 sm:mt-6 h-px w-full bg-black/10" />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-black/85">
                  {formatWithDots(inputCount)}{" "}
                  <span className="font-normal text-black/45">
                    / {formatWithDots(MAX_CHARS)}
                  </span>
                </span>

                <div className="flex items-center gap-2 sm:gap-3 text-black/70">
                  {result && (
                    <button
                      className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
                      aria-label="Clear input"
                      type="button"
                      onClick={clearInput}
                      disabled={!text && !result && !error}
                      title="Clear"
                    >
                      <CircleX className="h-5 w-5" />
                    </button>
                  )}

                  <button
                    className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
                    aria-label={
                      speaking === "input" ? "Stop speech" : "Speaker"
                    }
                    type="button"
                    onClick={() => speakText(text, from, "input")}
                    disabled={!text}
                    title={speaking === "input" ? "Stop" : "Speak"}
                  >
                    {speaking === "input" ? (
                      <Square className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </button>

                  <button
                    className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
                    aria-label="Copy"
                    type="button"
                    onClick={() => copyToClipboard(text)}
                    disabled={!text}
                  >
                    <Copy className="h-5 w-5" />
                  </button>

                  {/* Speech-to-text for input */}
                  <button
                    className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
                    aria-label={
                      listening === "input"
                        ? "Stop dictation"
                        : "Start dictation"
                    }
                    type="button"
                    onClick={toggleDictationInput}
                    title={listening === "input" ? "Stop dictation" : "Dictate"}
                  >
                    {listening === "input" ? (
                      <Square className="h-5 w-5" />
                    ) : (
                      <Mic className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Output */}
          <div
            className={[
              "rounded-sm border border-black/10 bg-white",
              result ? "block" : "hidden",
              "md:block",
            ].join(" ")}
          >
            <div className="relative">
              <textarea
                className="w-full mt-4 rounded-sm bg-white p-5 resize-none"
                value={result ?? ""}
                disabled
              />

              {loading && !result && (
                <div className="pointer-events-none absolute left-5 top-8">
                  <Image
                    src="/3-dots-bounce.svg"
                    height={50}
                    width={50}
                    alt="Loading"
                  />
                </div>
              )}
            </div>

            <div className="p-4 pt-0 sm:p-5">
              <div className="mt-4 sm:mt-6 h-px w-full bg-black/10" />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[12px] font-semibold text-black/85">
                  {formatWithDots(outputCount)}{" "}
                  <span className="font-normal text-black/45">
                    / {formatWithDots(MAX_CHARS)}
                  </span>
                </span>

                <div className="flex items-center gap-2 sm:gap-3 text-black/70">
                  <button
                    className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
                    aria-label={
                      speaking === "output" ? "Stop speech" : "Speaker"
                    }
                    type="button"
                    onClick={() => speakText(result ?? "", to, "output")}
                    disabled={!result}
                    title={speaking === "output" ? "Stop" : "Speak"}
                  >
                    {speaking === "output" ? (
                      <Square className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
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
                    onClick={() =>
                      toast.info("Dictation is available on the input box")
                    }
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Language Row (moves above Translate on mobile) */}
        <div className="order-2 sm:order-1 mt-2 sm:mt-6 flex items-end gap-3">
          <div className="flex-1 min-w-35 sm:min-w-45">
            <Select
              id="from"
              label="From"
              value={from}
              onChange={(v) => {
                cancelSpeech();
                stopDictation();
                setFrom(v);
              }}
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
              onChange={(v) => {
                cancelSpeech();
                setTo(v);
              }}
              options={languageOptions}
              placeholder="To"
            />
          </div>
        </div>

        <div className="order-3 text-center pt-0.5">
          <button
            disabled={!text || loading}
            className="w-64 cursor-pointer text-center rounded-3xl bg-(--foreground) text-white py-3 font-medium hover:bg-(--accent) disabled:opacity-50"
            type="submit"
          >
            {loading ? "Translating..." : "Translate"}
          </button>

          {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        </div>
      </form>

      <footer className="mt-10 border-t border-black/10 bg-gray-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-2 md:py-5">
          <div className="md:flex md:justify-between md:gap-10">
            <div className="mb-8 md:mb-0 md:flex md:items-start md:gap-6">
              <a href="./" className="flex justify-center md:justify-start">
                <img src="./logo-nobg.png" className="h-14" alt="Nuance Logo" />
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
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gray-900 hover:underline"
                    >
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://www.linkedin.com/in/hakeemclarke/"
                      target="_blank"
                      rel="noopener noreferrer"
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
                  <li>
                    <a
                      href="/privacy"
                      className="hover:text-gray-900 hover:underline"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="/cookies"
                      className="hover:text-gray-900 hover:underline"
                    >
                      Cookie Policy
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
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gray-900 hover:underline"
              >
                Hakeem Clarke
              </a>
              . All Rights Reserved.
            </span>

            <div className="mt-4 flex items-center justify-center gap-5 sm:justify-end sm:mt-0">
              <a
                href="https://www.linkedin.com/in/hakeemclarke/"
                target="_blank"
                rel="noopener noreferrer"
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
                target="_blank"
                rel="noopener noreferrer"
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
                target="_blank"
                rel="noopener noreferrer"
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
