/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        pink: {
          DEFAULT: "#e91e8c",
          dark: "#b0006a",
          light: "#ff6ec4",
        },
        navy: {
          DEFAULT: "#1a1a2e",
          dark: "#0f0f1a",
          light: "#2d0a2e",
        },
      },
      backgroundImage: {
        "bank-gradient": "linear-gradient(135deg, #1a1a2e 0%, #2d0a2e 100%)",
        "pink-gradient": "linear-gradient(135deg, #e91e8c, #b0006a)",
      },
    },
  },
  plugins: [],
};
