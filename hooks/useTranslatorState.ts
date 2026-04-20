"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Domain, HistoryItem, Prefs, SynonymEntry } from "../types/translation";
import {
  formatWithDots,
  getDialectOptions,
  HISTORY_LIMIT,
  LANG_CODE_MAP,
  LS_HISTORY_KEY,
  LS_PREFS_KEY,
  MAX_CHARS,
  safeJsonParse,
} from "../lib/translatorUtils";

export function useTranslatorState() {
  const [text, setText] = useState("");
  const [from, setFrom] = useState("English");
  const [to, setTo] = useState("Spanish");
  const [dialect, setDialect] = useState("Standard");
  const [tone, setTone] = useState<"formal" | "informal" | "">("");
  const [plurality, setPlurality] = useState<"singular" | "plural" | "">("");
  const [gender, setGender] = useState<"unspecified" | "male" | "female" | "neutral">("unspecified");
  const [domain, setDomain] = useState<Domain>("general");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [synonyms, setSynonyms] = useState<SynonymEntry[]>([]);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsWrapRef = useRef<HTMLDivElement | null>(null);

  const [historyOpen, setHistoryOpen] = useState(false);
  const historyWrapRef = useRef<HTMLDivElement | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [speaking, setSpeaking] = useState<"input" | "output" | null>(null);
  const [listening, setListening] = useState<"input" | null>(null);

  const recognitionRef = useRef<any>(null);
  const dictationBaseRef = useRef<string>("");
  const formRef = useRef<HTMLFormElement | null>(null);

  // ── Select options ────────────────────────────────────────────────────────

  const languageOptions = useMemo(
    () => [
      "English", "Spanish", "French", "Russian",
      "German", "Japanese", "Chinese", "Portuguese",
    ].map((l) => ({ value: l, label: l })),
    [],
  );

  const dialectOptions = useMemo(
    () => getDialectOptions(to).map((d) => ({ value: d, label: d })),
    [to],
  );

  const toneOptions = useMemo(() => [
    { value: "formal", label: "Formal" },
    { value: "informal", label: "Informal" },
  ], []);

  const pluralityOptions = useMemo(() => [
    { value: "singular", label: "Singular" },
    { value: "plural", label: "Plural" },
  ], []);

  const genderOptions = useMemo(() => [
    { value: "unspecified", label: "Unspecified" },
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "neutral", label: "Neutral" },
  ], []);

  const domainOptions = useMemo(() => [
    { value: "legal", label: "Legal" },
    { value: "medical", label: "Medical" },
    { value: "financial", label: "Financial" },
    { value: "technical", label: "Technical" },
  ], []);

  // ── Persistence ───────────────────────────────────────────────────────────

  // Load prefs + history once on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedPrefs = safeJsonParse<Prefs>(window.localStorage.getItem(LS_PREFS_KEY));
    if (savedPrefs) {
      if (savedPrefs.dialect) setDialect(savedPrefs.dialect);
      if (savedPrefs.tone !== undefined) setTone(savedPrefs.tone);
      if (savedPrefs.plurality !== undefined) setPlurality(savedPrefs.plurality);
      if (savedPrefs.gender) setGender(savedPrefs.gender);
      if (savedPrefs.domain) setDomain(savedPrefs.domain);
    }

    const savedHistory = safeJsonParse<HistoryItem[]>(window.localStorage.getItem(LS_HISTORY_KEY));
    if (Array.isArray(savedHistory)) setHistory(savedHistory);
  }, []);

  // Persist prefs on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefs: Prefs = { dialect, tone, plurality, gender, domain };
    window.localStorage.setItem(LS_PREFS_KEY, JSON.stringify(prefs));
  }, [dialect, tone, plurality, gender, domain]);

  // Persist history on change
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  // Keep dialect valid when "to" language changes
  useEffect(() => {
    const allowed = getDialectOptions(to);
    if (!allowed.includes(dialect)) setDialect("Standard");
    if (!dialect) setDialect("Standard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to]);

  // ── Clipboard ─────────────────────────────────────────────────────────────

  async function copyToClipboard(value: string) {
    try {
      if (!value) return;
      await navigator.clipboard.writeText(value);
      toast.success("Copied!");
    } catch {
      toast.error("Something Went Wrong");
    }
  }

  // ── Text-to-speech ────────────────────────────────────────────────────────

  function cancelSpeech() {
    if (typeof window === "undefined") return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    setSpeaking(null);
  }

  function speakText(value: string, langLabel: string, which: "input" | "output") {
    if (!value) return;
    if (typeof window === "undefined") return;

    const synth = window.speechSynthesis;
    if (!synth) { toast.error("Speech not supported"); return; }

    if (speaking === which) { cancelSpeech(); return; }

    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(value);
    utterance.lang = LANG_CODE_MAP[langLabel] ?? "en-US";
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

  // ── Speech-to-text ────────────────────────────────────────────────────────

  function stopDictation() {
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.onresult = null;
        rec.onend = null;
        rec.onerror = null;
        rec.stop();
      } catch { /* ignore */ }
    }
    recognitionRef.current = null;
    setListening(null);
  }

  function toggleDictationInput() {
    if (typeof window === "undefined") return;
    if (listening === "input") { stopDictation(); return; }

    cancelSpeech();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech-to-text not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = LANG_CODE_MAP[from] ?? "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    dictationBaseRef.current = text;

    recognition.onresult = (event: any) => {
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

  // ── Input actions ─────────────────────────────────────────────────────────

  function clearInput() {
    cancelSpeech();
    stopDictation();
    setText("");
    setResult(null);
    setError(null);
    setSynonyms([]);
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

    const next = (text.slice(0, start) + pasted + text.slice(end)).slice(0, MAX_CHARS);

    if (next.length > MAX_CHARS) {
      toast.error("Input exceeds maximum length");
      return;
    }

    cancelSpeech();
    stopDictation();
    setText(next);
    setResult(null);
    setError(null);
    setSynonyms([]);
    handleTranslate(next);
  }

  // ── History ───────────────────────────────────────────────────────────────

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

  function loadHistoryItem(h: HistoryItem) {
    cancelSpeech();
    stopDictation();
    setFrom(h.from);
    setTo(h.to);
    setText(h.text);
    setResult(h.translation);
    setSynonyms([]);
    if (h.options.dialect) setDialect(h.options.dialect);
    if (h.options.tone) setTone(h.options.tone as any);
    if (h.options.plurality) setPlurality(h.options.plurality as any);
    if (h.options.gender) setGender(h.options.gender as any);
    if (h.options.domain) setDomain(h.options.domain as Domain);
    setHistoryOpen(false);
  }

  // ── Translation ───────────────────────────────────────────────────────────

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
    setSynonyms([]);

    const options = {
      dialect: dialect || undefined,
      tone: tone || undefined,
      plurality: plurality || undefined,
      gender: gender || undefined,
      domain: domain || undefined,
    };

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToTranslate, from, to, options }),
      });

      if (!res.ok) throw new Error("Translation failed");

      const data = await res.json();
      setResult(data.translation);
      setSynonyms(Array.isArray(data.synonyms) ? data.synonyms : []);
      addToHistory({ createdAt: Date.now(), from, to, text: textToTranslate, translation: data.translation, options });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Prefs reset ───────────────────────────────────────────────────────────

  function resetPreferences() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(LS_PREFS_KEY);
    }
    setDomain("general");
    setDialect("Standard");
    setTone("");
    setPlurality("");
    setGender("unspecified");
    toast.success("Preferences reset");
  }

  // ── Outside-click / Escape to close dropdowns ─────────────────────────────

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

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      cancelSpeech();
      stopDictation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // state
    text, from, to, dialect, tone, plurality, gender, domain,
    loading, result, error, synonyms,
    settingsOpen, setSettingsOpen, settingsWrapRef,
    historyOpen, setHistoryOpen, historyWrapRef,
    history, speaking, listening,
    formRef,
    // derived
    inputCount: text.length,
    outputCount: (result ?? "").length,
    // options
    languageOptions, dialectOptions, toneOptions, pluralityOptions, genderOptions, domainOptions,
    // setters
    setFrom, setTo, setDialect, setTone, setPlurality, setGender, setDomain,
    // handlers
    handleTranslate, handleInputChange, handleInputPaste,
    submitOnEnter, swapLanguages, clearInput,
    speakText, cancelSpeech, toggleDictationInput, stopDictation,
    copyToClipboard, clearHistory, loadHistoryItem, resetPreferences,
  };
}