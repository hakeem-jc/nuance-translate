import { Copy, Mic, Square, Volume2 } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import { formatWithDots, MAX_CHARS } from "../lib/translatorUtils";

type Props = {
  result: string | null;
  loading: boolean;
  outputCount: number;
  speaking: "input" | "output" | null;
  onSpeak: () => void;
  onCopy: () => void;
};

export function OutputBox({ result, loading, outputCount, speaking, onSpeak, onCopy }: Props) {
  return (
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
            <Image src="/3-dots-bounce.svg" height={50} width={50} alt="Loading" />
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
              aria-label={speaking === "output" ? "Stop speech" : "Speaker"}
              type="button"
              onClick={onSpeak}
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
              onClick={onCopy}
              disabled={!result}
            >
              <Copy className="h-5 w-5" />
            </button>

            <button
              className="h-9 w-9 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer"
              aria-label="Mic"
              type="button"
              onClick={() => toast.info("Dictation is available on the input box")}
            >
              <Mic className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}