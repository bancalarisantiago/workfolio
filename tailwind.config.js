/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F0FF',
          100: '#D1E3FF',
          200: '#A8C8FF',
          300: '#7FADFF',
          400: '#5691FF',
          500: '#2C7BEA',
          600: '#1369E0',
          700: '#0C6DD9',
          800: '#0A54AA',
          900: '#053170',
          DEFAULT: '#0C6DD9',
        },
        secondary: {
          50: '#E6FAFA',
          100: '#CFF5F5',
          200: '#9FEAEA',
          300: '#6FE0E0',
          400: '#3FD5D5',
          500: '#13C2C2',
          600: '#0F9B9B',
          700: '#0B7474',
          800: '#074D4D',
          900: '#032626',
          DEFAULT: '#13C2C2',
        },
      },
    },
  },
  plugins: [],
};
