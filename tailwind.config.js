/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}', './.storybook/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1ea7fd',
      },
    },
  },
  plugins: [],
};
