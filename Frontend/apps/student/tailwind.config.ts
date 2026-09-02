import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        capstone: {
          red: "var(--capstone-red)",
          "red-dark": "var(--capstone-red-dark)",
          "red-light": "var(--capstone-red-light)",
          "red-muted": "var(--capstone-red-light)",
          "red-chip": "var(--capstone-red-chip)",
          text: "var(--capstone-text)",
          muted: "var(--capstone-text-muted)",
          page: "var(--capstone-page)",
          border: "var(--capstone-border)",
          "green-bg": "var(--capstone-green-bg)",
          "green-text": "var(--capstone-green-text)",
        },
        figma: {
          page: "var(--capstone-page)",
          border: "var(--capstone-border)",
          muted: "var(--capstone-text-muted)",
          "green-bg": "var(--capstone-green-bg)",
          "green-text": "var(--capstone-green-text)",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.05)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "figma-xs": ["11px", { lineHeight: "16px" }],
        "figma-sm": ["13px", { lineHeight: "20px" }],
        "figma-base": ["14px", { lineHeight: "20px" }],
        "figma-lg": ["16px", { lineHeight: "24px" }],
        "figma-xl": ["22px", { lineHeight: "28px" }],
      },
    },
  },
  plugins: [],
};

export default config;
