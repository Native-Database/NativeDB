/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx,mdx}",
    "./src/components/**/*.{js,jsx,mdx}",
    "./src/app/**/*.{js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4de5b6",
        background: "#0a0c10",
        surface: "#12151c",
        border: "#1e232d",
        muted: "#9fb0bb",
      },
    },
  },
  plugins: [],
};
