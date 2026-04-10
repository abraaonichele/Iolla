/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        blush: "#fae8eb",
        rosewood: "#5c3a3a",
        rosewoodSoft: "#8a6a6a",
        petal: "#e6d0d4",
        petalLight: "#f3e6e8",
        canvas: "#fff5f7"
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Cormorant Garamond", "serif"]
      },
      boxShadow: {
        blush: "0 10px 30px rgba(230, 208, 212, 0.35)"
      }
    }
  },
  plugins: []
};
