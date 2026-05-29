/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        navy:  "#0b1733",
        teal:  "#2a9aa4",
        sun:   "#f5b21a",
        amber: "#ef7e1a",
        leaf:  "#3fae57",
      },
    },
  },
  plugins: [],
};
