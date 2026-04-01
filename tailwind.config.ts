import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        steel: {
          100: "#C2D7F1",
          300: "#78AEDA",
          500: "#4A90D9",
          600: "#3976B4",
          700: "#274C74",
        },
        cyan: {
          400: "#4AB7C7",
          500: "#3FA7B8",
        },
        gold: {
          300: "#E0B84A",
          500: "#C89B2A",
          700: "#8B6A1E",
        },
      },
      fontFamily: {
        sans: ["var(--font-body)", ...defaultTheme.fontFamily.sans],
        display: ["var(--font-display)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-mono)", ...defaultTheme.fontFamily.mono],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px rgba(0, 0, 0, 0.35)",
        steel: "0 18px 40px rgba(31, 61, 92, 0.24)",
        gold: "0 20px 48px rgba(200, 155, 42, 0.16)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
        "noise-faint":
          "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.05) 0, transparent 34%), radial-gradient(circle at 80% 0%, rgba(74,144,217,0.14) 0, transparent 30%), radial-gradient(circle at 80% 80%, rgba(200,155,42,0.12) 0, transparent 26%)",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        pulseRing: {
          "0%, 100%": { opacity: "0.28", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.02)" },
        },
        lift: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.8s linear infinite",
        pulseRing: "pulseRing 1.8s ease-in-out infinite",
        lift: "lift 420ms ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
