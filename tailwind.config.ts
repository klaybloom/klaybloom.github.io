import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        notion: {
          bg: "rgb(var(--color-bg) / <alpha-value>)",
          paper: "rgb(var(--color-paper) / <alpha-value>)",
          text: "rgb(var(--color-text) / <alpha-value>)",
          muted: "rgb(var(--color-muted) / <alpha-value>)",
          faint: "rgb(var(--color-faint) / <alpha-value>)",
          line: "rgb(var(--color-line) / <alpha-value>)",
          hover: "rgb(var(--color-hover) / <alpha-value>)",
          accent: "rgb(var(--color-accent) / <alpha-value>)",
          accentSoft: "rgb(var(--color-accent-soft) / <alpha-value>)"
        }
      },
      fontFamily: {
        sans: [
          "IBM Plex Sans",
          "PingFang SC",
          "Microsoft YaHei",
          "system-ui",
          "sans-serif"
        ],
        serif: [
          "Playfair Display",
          "Source Han Serif SC",
          "Songti SC",
          "Georgia",
          "serif"
        ],
        mono: [
          "IBM Plex Mono",
          "Menlo",
          "monospace"
        ]
      },
      lineHeight: {
        relaxedBody: "1.75"
      }
    }
  },
  plugins: []
};

export default config;
