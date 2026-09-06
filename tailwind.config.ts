import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f7f8",
          100: "#eeeef0",
          200: "#d9d9de",
          300: "#b6b6c0",
          400: "#8b8b9a",
          500: "#6b6b7b",
          600: "#535360",
          700: "#43434d",
          800: "#2f2f36",
          900: "#1c1c21",
          950: "#101013",
        },
        brand: {
          50: "#eef4ff",
          100: "#dce8ff",
          200: "#b8d0ff",
          300: "#8ab0ff",
          400: "#5a87ff",
          500: "#3660f5",
          600: "#2647d6",
          700: "#1f39ac",
          800: "#1d318a",
          900: "#1c2d6f",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(16, 16, 19, 0.04), 0 1px 6px -1px rgba(16, 16, 19, 0.06)",
      },
      borderRadius: {
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
};
export default config;
