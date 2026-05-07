/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class", '[dark-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--color-brand-primary)",
          secondary: "var(--color-brand-secondary)",
        },
        bg: {
          primary: "var(--bg-primary)",
          medium: "var(--bg-medium-primary)",
          secondary: "var(--bg-secondary)",
          white: "var(--bg-white)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          subtle: "var(--text-subtle)",
        },
      },
      borderRadius: {
        button: "var(--radius-button)",
        card: "var(--radius-card)",
        input: "var(--radius-input)",
        modal: "var(--radius-modal)",
      },
    },
  },
  plugins: [],
};
