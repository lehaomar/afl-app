/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        afl: {
          bg: '#0C0808',
          surface: '#150D0D',
          elevated: '#1F1414',
          border: '#321A1A',
          crimson: '#8B1A1A',
          'crimson-light': '#C0272D',
          gold: '#f59e0b',
          red: '#ef4444',
        },
      },
    },
  },
  plugins: [],
};
