import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}", "./src/lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "ink-950": "#04070f",
        "ink-900": "#060b18",
        "ink-800": "#0b1326",
        "ink-700": "#111c36",
        "ink-600": "#162448",
        "ink-500": "#1f305f",
        "ink-300": "#5f6b8c",
        "ink-100": "#e5e7ff",
        "accent-primary": "#6c63ff",
        "accent-secondary": "#80e0ff",
        "accent-emerald": "#5ce9b9",
        "accent-danger": "#ff7d9d",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        "glow-card": "0 25px 50px -12px rgba(6,11,24,0.55)",
        "glow-hero": "0 40px 120px -20px rgba(90,99,255,0.45)",
      },
      animation: {
        "pulse-slow": "pulse 6s ease-in-out infinite",
        float: "float 8s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
