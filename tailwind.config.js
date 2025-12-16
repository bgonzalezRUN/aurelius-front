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
        white: "#FFFFFF",

        primary:{
          primary: '#00A6B4',
          200: '#027c94',
          500: '#005A62',
          
        },

        grey: {
          primary: '#807D7D',
          50: '#CBCBCB',
          100: '#777777',
          200: '#EDEDED',
          300: "#948989",
          400: '#F6F6F6',
          500: '#F4F4F4',
          600: '#8D8686',
          700:' #454545',
          800: '#565656',
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
