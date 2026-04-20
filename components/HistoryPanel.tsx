import { History, Trash2 } from "lucide-react";
import { HistoryItem } from "../types/translation";

type Props = {
  open: boolean;
  onToggle: () => void;
  wrapRef: React.RefObject<HTMLDivElement | null>;
  history: HistoryItem[];
  onClear: () => void;
  onLoad: (item: HistoryItem) => void;
  onCopyOutput: (text: string) => void;
};

export function HistoryPanel({
  open, onToggle, wrapRef,
  history, onClear, onLoad, onCopyOutput,
}: Props) {
  return (
    <div className="relative" ref={wrapRef}>
      <button
        className="h-12 w-12 rounded-full border border-black/10 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.08)] flex items-center justify-center cursor-pointer"
        aria-label="Translation history"
        type="button"
        onClick={onToggle}
      >
        <History className="h-5 w-5 text-black/70 hover:text-black/95 transition-colors" />
      </button>

      {open && (
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
            <p className="text-sm font-semibold text-black/85">History</p>

            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-semibold text-black/70 hover:bg-black/5"
              disabled={history.length === 0}
              title="Clear history"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>

          {history.length === 0 ? (
            <p className="text-sm text-black/55">No translations yet.</p>
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

                  {h.options.domain && h.options.domain !== "general" && (
                    <p className="mt-1 text-[11px] text-black/45 capitalize">
                      {h.options.domain}
                    </p>
                  )}

                  <div className="mt-2 grid grid-cols-1 gap-2">
                    <div>
                      <p className="text-[11px] font-semibold text-black/60">Input</p>
                      <p className="text-[12px] text-black/75 line-clamp-3">{h.text}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-black/60">Output</p>
                      <p className="text-[12px] text-black/75 line-clamp-3">{h.translation}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-black/70 hover:bg-black/5"
                      onClick={() => onLoad(h)}
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      className="rounded-full px-3 py-1.5 text-[12px] font-semibold text-black/70 hover:bg-black/5"
                      onClick={() => onCopyOutput(h.translation)}
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
  );
}