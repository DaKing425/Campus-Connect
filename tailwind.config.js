/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'uw-purple': '#4B2E83',
        'uw-gold': '#B7A57A',
        // Add other UW-specific colors or a neutral palette
      },
      fontFamily: {
        sans: ['System', 'sans-serif'], // Use system font or specify a custom one
      },
    },
  },
  plugins: [],
}