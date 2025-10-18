import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        success: "#4CAF50",
        warning: "#FF9800",
        danger: "#F44336",
        muted: "#9E9E9E"
      }
    }
  },
  plugins: []
};

export default config;
