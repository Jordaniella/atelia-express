import { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles =
    "font-semibold rounded-button transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2";

  const variants = {
    primary:
      // "bg-[linear-gradient(135deg,_var(--brand-primary)_50%,_var(--brand-secondary)_100%)] hover:bg-[var(--brand-primary)] text-black shadow-lg shadow-[rgba(0,0,0,0.1)] px-6 py-5",
      "bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)] text-black shadow-lg shadow-[rgba(0,0,0,0.1)] px-6 py-5",

    secondary: "glass-effect hover:bg-white/10 text-white px-6 py-5",
    ghost: "text-gray-300 hover:text-white hover:bg-white/5 px-6 py-5",
    danger: "bg-red-600 hover:bg-red-700 text-white px-6 py-5",
  };

  const sizes = {
    sm: "px-4 py-2 text-[1rem]",
    md: "px-6 py-3 text-[1rem]",
    lg: "px-8 py-4 text-[1rem]",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </motion.button>
  );
};
