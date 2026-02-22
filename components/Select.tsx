import React from "react";

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
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full h-12 px-5 text-base
            border rounded-none
            text-color
            font-normal antialiased
            focus:outline-none focus:border-blue-600
            appearance-none
            cursor-pointer
            pr-12
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