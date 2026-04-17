import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        guinda: {
          DEFAULT: '#8A2035',
          light: '#A83248',
          dark: '#6B1829',
        },
        dorado: {
          DEFAULT: '#D4A94C',
          light: '#E5C474',
        },
        crema: '#FAF8F5',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
