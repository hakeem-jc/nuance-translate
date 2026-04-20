import { CircleX, Copy, Mic, Square, Volume2 } from "lucide-react";
import { formatWithDots, MAX_CHARS } from "../lib/translatorUtils";

type Props = {
  text: string;
  inputCount: number;
  result: string | null;
  speaking: "input" | "output" | null;
  listening: "input" | null;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onClear: () => void;
  onSpeak: () => void;
  onCopy: () => void;
  onToggleDictation: () => void;
};

export function InputBox({
  text, inputCount, result,
  speaking, listening,
  onChange, onPaste, onKeyDown,
  onClear, onSpeak, onCopy, onToggleDictation,
}: Props) {
  return (
    <div className="rounded-sm border border-black/10 bg-white">
      <textarea
        className="w-full mt-4 rounded-sm bg-white p-5 focus:outline-none resize-none"
        placeholder="Enter text to translate"
        value={text}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onChange={onChange}
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
                onClick={onClear}
                disabled={!text && !result}
                title="Clear"
              >
                <CircleX className="h-5 w-5" />
              </button>
            )}

            <button
              className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
              aria-label={speaking === "input" ? "Stop speech" : "Speaker"}
              type="button"
              onClick={onSpeak}
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
              onClick={onCopy}
              disabled={!text}
            >
              <Copy className="h-5 w-5" />
            </button>

            <button
              className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
              aria-label={listening === "input" ? "Stop dictation" : "Start dictation"}
              type="button"
              onClick={onToggleDictation}
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
  );
}