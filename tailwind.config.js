/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ECFDF8",
          100: "#D1FAEC",
          400: "#2DD4A8",
          500: "#10B98A",
          600: "#059673",
          700: "#047760",
        },
        money: "#14B8A6",
        everyday: "#F59E0B",
        student: "#8B5CF6",
        surface: {
          light: "#F7F8FA",
          dark: "#0F1115",
        },
        card: {
          light: "#FFFFFF",
          dark: "#1A1D23",
        },
      },
      borderRadius: {
        card: "20px",
      },
    },
  },
  plugins: [],
};
