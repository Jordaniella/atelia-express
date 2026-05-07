import { i } from "framer-motion/client";
import { ButtonHTMLAttributes, ReactNode } from "react";
import styled from "styled-components";

const ButtonBase = styled.button`
  @property --angle {
    syntax: "<angle>";
    initial-value: 60deg;
    inherits: false;
  }
  position: relative;
  padding:8px 20px; 
  &.primary {
    &:after {
      transform: scale(1.01, 1.09);
      background: conic-gradient(from var(--angle),transparent, var(--brand-secondary));
      animation: rotate 2s linear infinite;
    }
    &:before {
      transform: scale(1.07, 1.25);
      background: #ffffff;
    }
    &:after, &:before {
      opacity: 0;
      content: "";
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 1000px;
      z-index: -1;
      padding: 3px;
      transition: opacity 0.2s 0.3s ease, transform 0.5s ease;
    }
  }
  &.primary:hover { 
  background: radial-gradient(circle at bottom, var(--brand-primary), var(--brand-secondary));
   
  &:after {
      opacity: 1;
      transform: scale(1.01, 1.09);
    }
    &:before {
      opacity: 0.2;
    }
  }
  @keyframes rotate {
    from {
      --angle: 0deg;
    }
      to {
      --angle: 360deg;
    }
  }
` 

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
      "bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)] text-black shadow-lg shadow-[rgba(0,0,0,0.1)]",

    secondary: "glass-effect hover:bg-white/10 text-white",
    ghost: "text-gray-300 hover:text-white hover:bg-white/5",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-[1rem]",
    md: "px-6 py-3 text-[1rem]",
    lg: "px-8 py-4 text-[1rem]",
  };

  return (
    <ButtonBase
      className={`${baseStyles} ${variants[variant]} ${className} ${variant}`}
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
    </ButtonBase>
  );
};
