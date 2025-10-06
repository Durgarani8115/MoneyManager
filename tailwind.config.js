/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",   // for Next.js App Router
    "./pages/**/*.{js,ts,jsx,tsx}", // if using Pages Router
    "./components/**/*.{js,ts,jsx,tsx}", 
    "./src/**/*.{js,ts,jsx,tsx}"    // if you keep components inside src
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1E40AF", // custom brand color
          light: "#3B82F6",
          dark: "#1E3A8A"
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  darkMode: ["class"],  // for theme switching
plugins: [require("tailwindcss-animate")],

  plugins: [
    require("@tailwindcss/forms"),      // optional
    require("@tailwindcss/typography"), // optional
  ],
}
