import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0f',
        'bg-secondary': '#12121a',
        'bg-card': '#1a1a28',
        'accent-merge': '#00e676',
        'accent-close': '#ff1744',
        'accent-gold': '#ffd700',
        'text-primary': '#f0f0f8',
        'text-secondary': '#8888aa',
        'border-subtle': '#2a2a3a',
      },
      fontFamily: {
        'display': ['Syne', 'sans-serif'],
        'body': ['DM Mono', 'monospace'],
        'mono': ['Space Mono', 'monospace'],
      },
      boxShadow: {
        'glow-merge': '0 0 30px rgba(0,230,118,0.3)',
        'glow-close': '0 0 30px rgba(255,23,68,0.3)',
      },
    },
  },
  plugins: [],
} satisfies Config
