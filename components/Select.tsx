import React, { useMemo } from "react";

type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  id: string;
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
};

const LANGUAGE_TO_COUNTRY_CODE: Record<
  | "English"
  | "Spanish"
  | "French"
  | "Russian"
  | "German"
  | "Japanese"
  | "Chinese"
  | "Portuguese",
  string
> = {
  English: "GB",
  Spanish: "ES",
  French: "FR",
  Russian: "RU",
  German: "DE",
  Japanese: "JP",
  Chinese: "CN",
  Portuguese: "PT",
};

const Select: React.FC<SelectProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = "Select",
  error,
  required = false,
}) => {
  const countryCode = useMemo(() => {
    const code = LANGUAGE_TO_COUNTRY_CODE[value as keyof typeof LANGUAGE_TO_COUNTRY_CODE];
    return code ?? "";
  }, [value]);

  return (
    <div>
      <label
        htmlFor={id}
        className="grid grid-cols-[auto_1fr] gap-1.5 mb-1.5 font-semibold text-gray-400 antialiased"
      >
        <span>{label}</span>
        {required && <span className="text-gray-400">*</span>}
      </label>

      <div className="relative">
        {countryCode && (
          <img
            src={`https://flagsapi.com/${countryCode}/flat/64.png`}
            alt={`${value} flag`}
            className="absolute left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-sm pointer-events-none"
          />
        )}

        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full h-12 text-sm bg-gray-50
            border border-black/10 rounded-none
            text-color
            font-normal antialiased
            focus:outline-none focus:border-blue-600
            appearance-none
            cursor-pointer
            pr-12
            ${countryCode ? "pl-10 sm:pl-12" : "pl-5"}
            ${error ? "border-red-500" : "border-[#bab8c6]"}
          `}
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Custom dropdown arrow */}
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Select;