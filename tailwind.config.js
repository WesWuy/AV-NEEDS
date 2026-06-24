/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9ecff',
          500: '#1f6feb',
          600: '#1a5fce',
          700: '#1648a0',
          900: '#0d2a5e',
        },
      },
    },
  },
  plugins: [],
};
