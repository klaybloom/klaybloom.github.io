import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        notion: {
          bg: "#ffffff",
          text: "#37352f",
          muted: "#787774",
          faint: "#9b9a97",
          line: "#eeeeec",
          hover: "#efefed"
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
