import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff, Lock, LucideIcon, Mail, MailWarning, User } from "lucide-react";
import styled from "styled-components";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const CIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 13px;
  & + input {
    padding-left: 44px;
    padding-top: 8px;
    padding-bottom: 8px;
    padding-right: 12px;
    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
      -webkit-text-fill-color: var(--text-primary) !important; /* texte */
      caret-color: var(--text-primary) !important; /* curseur */
      transition: background-color 9999s ease-out 0s; /* évite le flash */
      box-shadow: 0 0 0px 100px var(--bg-secondary) inset !important;
    }

    /* Firefox (support partiel selon versions) */
    &:autofill {
      -webkit-text-fill-color: var(--text-primary) !important;
    }
  }
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", type, children, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === "password";
    const inputType = isPasswordField && showPassword ? "text" : type;

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-[1rem] font-medium text-[var(--text-primary)]">
            {label}
          </label>
        )}
        <div className="relative">
          <CIcon>
            {/* {icon === "email" ? (
              error ? (
                <MailWarning className="text-red-500" />
              ) : (
                <Mail className="w-5 h-5 text-gray-400" />
              )
            ) : icon === "user" ? (
              <User
                className={`w-5 h-5 ${error ? "text-red-500" : "text-gray-400"}`}
              />
            ) : (
              <Lock
                className={`w-5 h-5 ${error ? "text-red-500" : "text-gray-400"}`}
              />
            )} */}
            {children}
          </CIcon>
          <input
            ref={ref}
            type={inputType}
            className={`
              w-full rounded-input
              bg-[var(--bg-primary)]
              border border-[var(--bg-secondary)]
              text-white
              focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent
              transition-all duration-200
              ${isPasswordField ? "pr-12" : ""}
              ${error ? "border-red-500 focus:ring-red-500" : ""}
              ${className}
            `}
            {...props}
          />
          {isPasswordField && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";
