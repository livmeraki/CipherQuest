import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#13202a",
        paper: "#fbfaf6",
        teal: "#0f766e",
        coral: "#d85a44",
        gold: "#d49b22",
        mint: "#dff7ee"
      },
      boxShadow: {
        soft: "0 14px 40px rgba(19,32,42,0.12)"
      }
    }
  },
  plugins: []
};

export default config;

