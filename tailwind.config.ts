import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        main: "var(--main-color)",
        lavender: "var(--lavender)",
      },
      backgroundImage: {
        hero: "url('/images/bg-hero.png')",
      },
    },
  },
  plugins: [],
} satisfies Config;
