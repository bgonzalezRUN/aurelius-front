/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['Nunito Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    extend: {
      colors: {
        primaryDark: '#01687d',
        secondary: '#007A87',
        primaryHover: '#5bb4cf',

        grey: {
          primary: '#807D7D',
          100: '#777777',
          200: '#EDEDED',
        },
        green: {
          primary: '#0D9800',
        },
        red: {
          primary: '#C42D2D',
        },
        orange: {
          primary: '#C4622D',
        },
      },
    },
  },
  plugins: [],
};
