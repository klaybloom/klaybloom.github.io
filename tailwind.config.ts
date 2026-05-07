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
          bg: "#edf3f8",
          paper: "#fbfcfd",
          text: "#1f2937",
          muted: "#66748a",
          faint: "#93a0b2",
          line: "#d8e2ed",
          hover: "#eef4f8",
          accent: "#24866b",
          accentSoft: "#e6f2ee"
        }
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "PingFang SC",
          "Microsoft YaHei",
          "sans-serif"
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
