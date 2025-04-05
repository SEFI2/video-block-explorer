/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
          dark: '#2563eb',
        },
        accent: '#8b5cf6',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        dark: {
          DEFAULT: '#1f2937',
          lighter: '#374151',
          darker: '#111827',
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-card": "linear-gradient(to bottom right, #1f2937, #111827)",
      },
    },
  },
  plugins: [],
}

