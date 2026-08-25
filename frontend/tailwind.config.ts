import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
          800: '#1e40af', 900: '#1e3a8a'
        },
        science: { light: '#e0f2fe', DEFAULT: '#0ea5e9', dark: '#0369a1' },
        danger: { light: '#fef2f2', DEFAULT: '#ef4444', dark: '#991b1b' },
        warning: { light: '#fffbeb', DEFAULT: '#f59e0b', dark: '#92400e' },
        success: { light: '#f0fdf4', DEFAULT: '#22c55e', dark: '#166534' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
