/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        afl: {
          bg: '#09111e',
          surface: '#111827',
          elevated: '#1e293b',
          border: '#2d3748',
          green: '#22c55e',
          'green-dark': '#16a34a',
          gold: '#f59e0b',
          red: '#ef4444',
        },
      },
    },
  },
  plugins: [],
};
