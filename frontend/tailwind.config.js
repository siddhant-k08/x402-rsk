/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  plugins: [],
  theme: {
    extend: {
      colors: {
        "gray-700": "#3a3a3a",
        "gray-500": "#515151",
        "gray-600": "#2a2a2a",

        "brand-purple": "#9e76ff",
        "brand-green": "#79c600",
        "brand-pink": "#ff71e1",
        "brand-pink-dark": "#ab4b96",
        "brand-orange": "#ff9100",
        "brand-cyan": "#08ffd0",
        "brand-yellow": "#713f12",
        "brand-lime": "#deff1a",
        "brand-red": "#ff2323",
        highlighted: "#deff1a",
        "dark-brown": "#713f12",
        border: "#484848",

        "white-100": "#fbfbfb",
        "white-200": "#cccccc",
        "white-400": "#b8b8b8",
        "btn-secondary": "#262626",
        success: "#79c600",

        background: "#000",
        foreground: "#1c1c1c",
        primary: "#000",
        secondary: "#131313",
      },
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
}
