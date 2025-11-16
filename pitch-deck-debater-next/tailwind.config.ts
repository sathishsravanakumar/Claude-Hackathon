import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e7f5f7',
          100: '#d1ecf1',
          200: '#bee5eb',
          300: '#a8dde5',
          400: '#17a2b8',
          500: '#138496',
          600: '#0c5460',
        },
        beige: {
          50: '#fafaf8',
          100: '#f5f5dc',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero': 'linear-gradient(rgba(245, 245, 220, 0.85), rgba(250, 248, 243, 0.85)), url("https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&q=80")',
      },
      boxShadow: {
        'card': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.15)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
export default config
