import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fffdf0',
          100: '#fffae0',
          200: '#fff3b8',
          300: '#ffe885',
          400: '#ffd647',
          500: '#d9a91c',
          600: '#b88612',
          700: '#936310',
          800: '#794d14',
          900: '#673e16',
        },
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0055a5',
          700: '#003670',
          800: '#0d2342',
          900: '#0a192f',
        }
      },
    },
  },
  plugins: [],
};
export default config;
