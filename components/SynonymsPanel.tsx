import { SynonymEntry } from "../types/translation";

type Props = {
  synonyms: SynonymEntry[];
  onCopy: (word: string) => void;
};

export function SynonymsPanel({ synonyms, onCopy }: Props) {
  if (!synonyms || synonyms.length === 0) return null;

  return (
    <div className="w-11/12 mx-auto max-w-6xl mt-8 mb-8">
      <p className="text-[12px] font-semibold text-black/45 uppercase tracking-wider mb-3">
        Synonyms &amp; Alternatives
      </p>

      <div className="flex flex-col gap-4">
        {synonyms.map((entry) => (
          <div key={entry.word}>
            <p className="text-[13px] font-semibold text-black/70 mb-2">
              {entry.word}
            </p>

            <div className="flex flex-wrap gap-2">
              {entry.synonyms.map((syn) => (
                <button
                  key={syn}
                  type="button"
                  onClick={() => onCopy(syn)}
                  title={`Copy "${syn}"`}
                  className="
                    rounded-full border border-black/10 bg-white
                    px-3 py-1.5 text-[13px] text-black/70
                    hover:border-black/25 hover:bg-black/3 hover:text-black/90
                    shadow-[0_2px_8px_rgba(0,0,0,0.05)]
                    transition-colors cursor-pointer
                  "
                >
                  {syn}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}