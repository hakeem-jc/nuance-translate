import { useRef } from "react";
import { Settings } from "lucide-react";
import Select from "@/components/Select";
import { Domain } from "../types/translation";

type Props = {
  open: boolean;
  onToggle: () => void;
  wrapRef: React.RefObject<HTMLDivElement | null>;
  domain: Domain;
  setDomain: (v: Domain) => void;
  domainOptions: { value: string; label: string }[];
  dialect: string;
  setDialect: (v: string) => void;
  dialectOptions: { value: string; label: string }[];
  tone: string;
  setTone: (v: any) => void;
  toneOptions: { value: string; label: string }[];
  plurality: string;
  setPlurality: (v: any) => void;
  pluralityOptions: { value: string; label: string }[];
  gender: string;
  setGender: (v: any) => void;
  genderOptions: { value: string; label: string }[];
  onReset: () => void;
};

export function SettingsPanel({
  open, onToggle, wrapRef,
  domain, setDomain, domainOptions,
  dialect, setDialect, dialectOptions,
  tone, setTone, toneOptions,
  plurality, setPlurality, pluralityOptions,
  gender, setGender, genderOptions,
  onReset,
}: Props) {
  return (
    <div className="relative" ref={wrapRef}>
      <button
        className="h-12 w-12 rounded-full border border-black/10 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.08)] flex items-center justify-center cursor-pointer"
        aria-label="Settings"
        type="button"
        onClick={onToggle}
      >
        <Settings className="h-5 w-5 text-black/70 hover:text-black/95 transition-colors" />
      </button>

      {open && (
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
              id="domain"
              label="Domain"
              value={domain}
              onChange={(v) => setDomain(v as Domain)}
              options={domainOptions}
              placeholder="General"
            />

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
                onClick={onReset}
              >
                Reset preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}