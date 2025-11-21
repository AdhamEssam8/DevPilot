/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          light: '#F9FAFB',
          default: '#FFFFFF',
        },
        primary: {
          main: '#3B82F6',
        },
        secondary: {
          main: '#6B7280',
        },
        text: {
          primary: '#111827',
          secondary: '#6B7280',
          disabled: '#9CA3AF',
        },
        border: {
          default: '#E5E7EB',
          focus: '#3B82F6',
        },
        status: {
          pending: '#FCD34D',
        },
      },
      borderRadius: {
        sm: '4px',
        md: '6px',
        lg: '8px',
      },
    },
  },
  plugins: [],
}

