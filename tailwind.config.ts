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
          bg: "#f7f5f0",
          paper: "#fffdf8",
          text: "#1a1a1a",
          muted: "#555555",
          faint: "#888888",
          line: "#e0dbd3",
          hover: "#f0ece4",
          accent: "#2d5a3d",
          accentSoft: "#e8f0eb"
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
