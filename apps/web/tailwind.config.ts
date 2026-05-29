import type { Config } from "tailwindcss";
// Ddotsmedia four-dot brand identity.
export default {
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy:  "#0b1733",   // deep navy background
        teal:  "#2a9aa4",   // primary
        sun:   "#f5b21a",   // yellow dot
        amber: "#ef7e1a",   // orange dot
        leaf:  "#3fae57",   // green dot
      },
    },
  },
  plugins: [],
} satisfies Config;
