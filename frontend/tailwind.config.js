/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#1E293B',    // Slate
          secondary: '#059669',  // Emerald
          bg: '#FFFFFF',         // White Background
          surface: '#F8FAFC',    // Section Background
          card: '#FFFFFF',       // Card
          heading: '#0F172A',    // Heading
          body: '#475569',       // Body Text
          border: '#E2E8F0',     // Border
          accent: '#F59E0B',     // Amber
        }
      },
      boxShadow: {
        'stripe': '0 2px 5px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        'stripe-hover': '0 7px 14px rgba(0, 0, 0, 0.08), 0 3px 6px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
}