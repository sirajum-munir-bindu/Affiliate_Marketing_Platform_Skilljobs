import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#E53945",
          "red-hover": "#D12B37",
          "red-light": "#FEF2F2",
          blue: "#2563EB",
          "blue-hover": "#1D4ED8",
          "blue-light": "#EFF6FF",
          navy: "#172033",
          "navy-light": "#1E293B",
          text: "#475569",
          muted: "#64748B",
          bg: "#F8FAFC",
          border: "#E2E8F0",
          success: "#16A34A",
          warning: "#D97706",
          error: "#DC2626",
        },
      },
      fontFamily: {
        bangla: ["'Hind Siliguri'", "sans-serif"],
        sans: ["'Plus Jakarta Sans'", "Inter", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        hover: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
export default config;
