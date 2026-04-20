"use client";
import { ToastContainer } from "react-toastify";
import { useTranslatorState } from "@/hooks/useTranslatorState";
import { HistoryPanel } from "@/components/HistoryPanel";
import { SettingsPanel } from "@/components/SettingsPanel";
import { InputBox } from "@/components/InputBox";
import { OutputBox } from "@/components/OutputBox";
import { LanguageRow } from "@/components/LanguageRow";
import { SynonymsPanel } from "@/components/SynonymsPanel";
import { TranslatorFooter } from "@/components/TranslatorFooter";

export default function TranslatorPage() {
  const s = useTranslatorState();

  return (
    <main className="bg-(--background)">
      <header className="text-center p-4 mb-2 shadow-sm w-full">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-semibold tracking-tight text-black/90">
            Nuance Translate
          </h1>

          <div className="flex items-center gap-2">
            <HistoryPanel
              open={s.historyOpen}
              onToggle={() => { s.setHistoryOpen((v) => !v); s.setSettingsOpen(false); }}
              wrapRef={s.historyWrapRef}
              history={s.history}
              onClear={s.clearHistory}
              onLoad={s.loadHistoryItem}
              onCopyOutput={s.copyToClipboard}
            />

            <SettingsPanel
              open={s.settingsOpen}
              onToggle={() => { s.setSettingsOpen((v) => !v); s.setHistoryOpen(false); }}
              wrapRef={s.settingsWrapRef}
              domain={s.domain}
              setDomain={s.setDomain}
              domainOptions={s.domainOptions}
              dialect={s.dialect}
              setDialect={s.setDialect}
              dialectOptions={s.dialectOptions}
              tone={s.tone}
              setTone={s.setTone}
              toneOptions={s.toneOptions}
              plurality={s.plurality}
              setPlurality={s.setPlurality}
              pluralityOptions={s.pluralityOptions}
              gender={s.gender}
              setGender={s.setGender}
              genderOptions={s.genderOptions}
              onReset={s.resetPreferences}
            />
          </div>
        </div>
      </header>

      <form
        ref={s.formRef}
        className="flex flex-col gap-4 w-11/12 mx-auto max-w-6xl"
        onSubmit={(e) => { e.preventDefault(); s.handleTranslate(); }}
      >
        <section className="order-1 sm:order-2 mt-1 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <InputBox
            text={s.text}
            inputCount={s.inputCount}
            result={s.result}
            speaking={s.speaking}
            listening={s.listening}
            onChange={s.handleInputChange}
            onPaste={s.handleInputPaste}
            onKeyDown={s.submitOnEnter}
            onClear={s.clearInput}
            onSpeak={() => s.speakText(s.text, s.from, "input")}
            onCopy={() => s.copyToClipboard(s.text)}
            onToggleDictation={s.toggleDictationInput}
          />

          <OutputBox
            result={s.result}
            loading={s.loading}
            outputCount={s.outputCount}
            speaking={s.speaking}
            onSpeak={() => s.speakText(s.result ?? "", s.to, "output")}
            onCopy={() => s.copyToClipboard(s.result ?? "")}
          />
        </section>

        <LanguageRow
          from={s.from}
          to={s.to}
          languageOptions={s.languageOptions}
          onFromChange={(v) => { s.cancelSpeech(); s.stopDictation(); s.setFrom(v); }}
          onToChange={(v) => { s.cancelSpeech(); s.setTo(v); }}
          onSwap={s.swapLanguages}
        />

        <div className="order-3 text-center pt-0.5">
          <button
            disabled={!s.text || s.loading}
            className="w-64 cursor-pointer text-center rounded-3xl bg-(--foreground) text-white py-3 font-medium hover:bg-(--accent) disabled:opacity-50"
            type="submit"
          >
            {s.loading ? "Translating..." : "Translate"}
          </button>

          {s.error && <p className="text-sm text-red-400 mt-2">{s.error}</p>}
        </div>
      </form>

      <SynonymsPanel
        synonyms={s.synonyms}
        onCopy={s.copyToClipboard}
      />

      <TranslatorFooter />

      <ToastContainer position="bottom-right" />
    </main>
  );
}