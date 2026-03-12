import { ChevronDown } from "lucide-react";
import { SelectHTMLAttributes, forwardRef } from "react";

interface Option {
  label: string;
  value: string;
}

interface SelectFormProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
}

export const SelectForm = forwardRef<HTMLSelectElement, SelectFormProps>(
  ({ label, error, options, placeholder, className = "", ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-[1rem] font-medium text-gray-300">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full appearance-none rounded-xl
              bg-[var(--color-gray-dark)]
              border border-[var(--color-gray-medium)]
              text-white
              px-4 py-3 pr-12
              focus:outline-none focus:ring-2 focus:ring-[var(--color-ai-purple)]
              transition-all duration-200
              ${error ? "border-red-500 focus:ring-red-500" : ""}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled hidden>
                {placeholder}
              </option>
            )}

            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

SelectForm.displayName = "SelectForm";