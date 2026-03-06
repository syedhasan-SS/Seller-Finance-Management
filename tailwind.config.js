/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        fleek: {
          yellow: '#F8C642',
          'yellow-light': '#FEF9E7',
          'yellow-mid': '#FBD96A',
          'yellow-dark': '#E5A800',
          black: '#000000',
          'gray-900': '#111111',
          'gray-800': '#1F1F1F',
          'gray-700': '#2C2C2C',
        },
      },
      fontFamily: {
        sans: ['Montserrat', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
