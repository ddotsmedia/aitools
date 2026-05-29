import type { Config } from "tailwindcss";
// Ddotsmedia four-dot brand identity.
export default {
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy:  "#0b1733",
        charcoal: "#0a0f1e",
        teal:  "#2a9aa4",
        sun:   "#f5b21a",
        amber: "#ef7e1a",
        leaf:  "#3fae57",
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
