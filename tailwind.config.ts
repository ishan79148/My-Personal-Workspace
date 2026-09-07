import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#FBFAF6",
          dim: "#F3F0E8",
        },
        ink: {
          DEFAULT: "#211D17",
          muted: "#726A5C",
          faint: "#A79E8E",
        },
        moss: {
          DEFAULT: "#3C6E47",
          dark: "#2B4F34",
          light: "#E9F0E8",
        },
        line: {
          DEFAULT: "#E6E1D5",
          strong: "#D3CCBB",
        },
        gold: "#B0872B",
        rust: "#AD4A32",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        panel: "0 1px 2px 0 rgb(33 29 23 / 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
