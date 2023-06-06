import type { Config } from "tailwindcss";
// const { fontFamily } = require("tailwindcss/defaultTheme");

export default {
  darkMode: ["class"],
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gradient-x": "gradient-x 5s ease infinite"
      },
      aspectRatio: {
        laptop: "16/10"
      },
      backgroundImage: {
        "crl-texture-7": "url('/img/crl-texture-7.svg)"
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)"
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        crl: {
          "deep-purple": "#190f33",
          "dark-blue": "#0037a5",
          "electric-purple": "#6933ff",
          "iridescent-blue": "#00fced",
          "action-blue": "#0055ff",
          "light-blue": "#c2d5ff",
          "action-purple": "#b921f1",
          "light-purple": "#f7d6ff",
          neutral: {
            "100": "#f5f7fa",
            "200": "#e7ecf3",
            "300": "#d6dbe7",
            "400": "#c0c6d9",
            "500": "#7e89a9",
            "600": "#475872",
            "700": "#394455",
            "800": "#242a35",
            "900": "#060c12"
          }
        }
      },
      fontFamily: {
        "atkinson-hyperlegible": ["'Atkinson Hyperlegible'", "sans-serif"],
        poppins: ["'Poppins'", "sans-serif"]
        // sans: ["var(--font-sans)", ...fontFamily.sans]
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center"
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center"
          }
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        }
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
} satisfies Config;
