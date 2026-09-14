/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        roadsense: {
          dark: '#090D16',
          panel: '#0F172A',
          card: '#131D33',
          border: '#1E293B',
          accent: '#10B981', // emerald
          warning: '#F59E0B', // amber
          restricted: '#F97316', // orange
          danger: '#EF4444', // crimson
          info: '#38BDF8', // sky
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'radar-sweep 4s linear infinite',
        'scan-line': 'scan-line 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.6', transform: 'scale(1.05)' },
        },
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'scan-line': {
          '0%': { top: '0%' },
          '100%': { top: '95%' },
        },
      },
    },
  },
  plugins: [],
};
