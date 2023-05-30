import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        "gradient-x": "gradient-x 5s ease infinite"
      },
      aspectRatio: {
        laptop: "16/10"
      },
      backgroundImage: {
        "crl-texture-7": "url('/img/crl-texture-7.svg)"
      },
      colors: {
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
        poppins: ["'Poppins'", "sans-serif"]
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
        }
      }
    }
  },
  plugins: []
} satisfies Config;
