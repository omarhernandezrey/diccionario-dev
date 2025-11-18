import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}", "./src/lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
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
        "accent-cyan": "#06b6d4",
        "accent-amber": "#f59e0b",
        "accent-rose": "#f43f5e",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        "glow-card": "0 25px 50px -12px rgba(6,11,24,0.55)",
        "glow-hero": "0 40px 120px -20px rgba(90,99,255,0.45)",
        "sm-light": "0 1px 2px 0 rgba(0,0,0,0.05)",
        "md-light": "0 4px 6px -1px rgba(0,0,0,0.1)",
        "lg-light": "0 10px 15px -3px rgba(0,0,0,0.1)",
        "xl-card": "0 20px 25px -5px rgba(0,0,0,0.2)",
      },
      animation: {
        "pulse-slow": "pulse 6s ease-in-out infinite",
        float: "float 8s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "bounce-soft": "bounceSoft 2s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      backgroundImage: {
        "gradient-admin": "linear-gradient(135deg, #060b18 0%, #0b1326 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(15,23,42,0.8) 0%, rgba(30,41,59,0.8) 100%)",
        "gradient-primary": "linear-gradient(135deg, #6c63ff 0%, #8b5cf6 100%)",
        "gradient-accent": "linear-gradient(135deg, #06b6d4 0%, #80e0ff 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
