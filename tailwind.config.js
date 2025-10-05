/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'light-bg': '#F7F7F8',
        'light-bg-secondary': '#FFFFFF',
        'dark-bg': '#18181B',
        'dark-bg-secondary': '#27272A',
        'brand-orange': '#F97316',
        'brand-orange-light': '#FB923C',
      },
      borderRadius: {
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem', // New, very rounded corners for the modern design
      },
      fontFamily: {
        sans: ['Tajawal', ...defaultTheme.fontFamily.sans],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-in-up': 'fadeInUp 0.3s ease-out forwards',
        'glow': 'glow 2.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': { 'box-shadow': '0 0 8px 0px rgba(251, 146, 60, 0.5)' },
          '50%': { 'box-shadow': '0 0 20px 5px rgba(251, 146, 60, 0.2)' },
        }
      },
    },
  },
  plugins: [],
}