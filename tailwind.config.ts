import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}", "./src/lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        neo: {
          bg: "var(--neo-bg)",
          card: "var(--neo-card)",
          surface: "var(--neo-surface)",
          border: "var(--neo-border)",
          "text-primary": "var(--neo-text-primary)",
          "text-secondary": "var(--neo-text-secondary)",
          primary: "var(--neo-primary)",
          "primary-dark": "var(--neo-primary-dark)",
          "primary-light": "var(--neo-primary-light)",
          "accent-pink": "var(--neo-accent-pink)",
          "accent-purple": "var(--neo-accent-purple)",
          "accent-cyan": "var(--neo-accent-cyan)",
          "accent-lime": "var(--neo-accent-lime)",
          "accent-orange": "var(--neo-accent-orange)",
        },
        accent: {
          primary: "#6c63ff",
          secondary: "#80e0ff",
          emerald: "#5ce9b9",
          danger: "#ff7d9d",
          cyan: "#06b6d4",
          amber: "#f59e0b",
          rose: "#f43f5e",
        },
      },
      spacing: {
        xs: "var(--space-xs)",
        sm: "var(--space-sm)",
        md: "var(--space-md)",
        lg: "var(--space-lg)",
        xl: "var(--space-xl)",
        "2xl": "var(--space-2xl)",
        "3xl": "var(--space-3xl)",
        "4xl": "var(--space-4xl)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        xs: "0 1px 2px rgba(0,0,0,0.05)",
        sm: "0 2px 4px rgba(0,0,0,0.07)",
        md: "0 4px 12px rgba(0,0,0,0.08)",
        lg: "0 8px 24px rgba(0,0,0,0.10)",
        xl: "0 12px 32px rgba(0,0,0,0.12)",
        "2xl": "0 18px 48px rgba(0,0,0,0.14)",
        "glow-card": "0 25px 50px -12px rgba(6,11,24,0.55)",
        "glow-hero": "0 40px 120px -20px rgba(90,99,255,0.45)",
        "sm-light": "0 1px 2px 0 rgba(0,0,0,0.05)",
        "md-light": "0 4px 6px -1px rgba(0,0,0,0.1)",
        "lg-light": "0 10px 15px -3px rgba(0,0,0,0.1)",
        "xl-card": "0 20px 25px -5px rgba(0,0,0,0.2)",
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
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "pulse-slow": "pulse 6s ease-in-out infinite",
        float: "float 8s ease-in-out infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "bounce-soft": "bounceSoft 2s ease-in-out infinite",
        marquee: "marquee 60s linear infinite",
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
