/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'capri': '#01BFFF',
        'maya-blue': '#60CCFF',
        'winter-wizard': '#96DDFF',
        'ryb-yellow': '#FFFA32',
        'dodger-blue': '#2E85FF',
        'ryb-blue': '#004AFF',
        primary: {
          DEFAULT: '#01BFFF', // Capri as primary color
          light: '#60CCFF',   // Maya Blue
          lighter: '#96DDFF', // Winter Wizard
          dark: '#004AFF',    // RYB Blue
          darker: '#2E85FF',  // Dodger Blue
        },
        accent: {
          DEFAULT: '#FFFA32', // RYB Yellow
        },
      },
      aspectRatio: {
        'poster': '2/3',
      },
    },
  },
  plugins: [],
}
