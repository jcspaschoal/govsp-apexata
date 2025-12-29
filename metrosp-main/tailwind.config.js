/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      spacing: {
        128: "32rem",
      },
      backgroundImage: {
        login: "url('./src/assets/logo.jpg')",
      },
    },
  },
  plugins: [],
};
