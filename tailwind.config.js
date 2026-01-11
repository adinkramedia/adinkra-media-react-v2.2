/** @type {import('tailwindcss').Config} */
const lineClamp = require('@tailwindcss/line-clamp');

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        adinkra: {
          bg: "#194138",
          card: "rgba(39, 88, 72, 0.95)",
          gold: "#fbe5b6",
          highlight: "#f8b735",
        },
      },
    },
  },
  plugins: [],
};
