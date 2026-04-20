import { ArrowLeftRight } from "lucide-react";
import Select from "@/components/Select";

type Props = {
  from: string;
  to: string;
  languageOptions: { value: string; label: string }[];
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onSwap: (e: React.MouseEvent) => void;
};

export function LanguageRow({ from, to, languageOptions, onFromChange, onToChange, onSwap }: Props) {
  return (
    <div className="order-2 sm:order-1 mt-2 sm:mt-6 flex items-end gap-3">
      <div className="flex-1 min-w-35 sm:min-w-45">
        <Select
          id="from"
          label="From"
          value={from}
          onChange={onFromChange}
          options={languageOptions}
          placeholder="From"
        />
      </div>

      <button
        className="h-10 w-10 shrink-0 rounded-full bg-black text-white shadow-[0_14px_30px_rgba(0,0,0,0.18)] flex items-center justify-center mb-1.5"
        aria-label="Swap"
        onClick={onSwap}
        type="button"
      >
        <ArrowLeftRight className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-35 sm:min-w-45">
        <Select
          id="to"
          label="To"
          value={to}
          onChange={onToChange}
          options={languageOptions}
          placeholder="To"
        />
      </div>
    </div>
  );
}