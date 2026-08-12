/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      // Single source of truth for the app's typeface — used everywhere
      // instead of one-off inline `style={{ fontFamily: ... }}` overrides.
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      // The app's constant light-blue page background, matching every
      // screen (login, dashboard, module pages).
      colors: {
        "app-bg": "#eef2fb",
      },
    },
  },
  plugins: [],
};
