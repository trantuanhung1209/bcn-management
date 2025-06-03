import type { Config } from "tailwindcss";
import daisyui from "daisyui";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      sm: '576px',
      md: '768px',
      lg: '992px',
      xl: '1280px',
      '2xl': '1280px',
    },
    extend: {
      colors: {
        "bcn-primary": "#424242",
        "bcn-secondary": "#9E9E9E",
        "bcn-highlight": "#969696",
        "bcn-dark": "#22223b",
        "bcn-light": "#f2e9e4",
        "bcn-complete": "#34C759",
        "bcn-in-progress": "#C39500",
        "bcn-pending": "#E60000",
        "bcn-error": "#E60000",
        "bcn-warning": "#FF9500",
        "bcn-info": "#5AC8FA",
        "bcn-success": "#34C759",
      },
    },
  },
  plugins: [daisyui],
} satisfies Config;