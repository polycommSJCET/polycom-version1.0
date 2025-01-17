import type { Config } from 'tailwindcss';

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        dark: {
          1: '#0A0F1C',
          2: '#131827',
          3: '#1E2438',
          4: '#2A3149',
        },
        light: {
          1: '#FFFFFF',
          2: '#F8FAFC',
          3: '#F1F5F9',
          4: '#E2E8F0',
        },
        blue: {
          1: '#3B82F6',
          2: '#60A5FA',
          accent: '#2563EB',
        },
        sky: {
          1: '#E0F2FE',
          2: '#F0F9FF',
          3: '#F8FAFC',
        },
        gray: {
          1: '#64748B',
          2: '#94A3B8',
          3: '#CBD5E1',
        },
        accent: {
          1: '#8B5CF6',
          2: '#6D28D9',
          3: '#4C1D95',
        },
        orange: {
          1: '#FF742E',
        },
        purple: {
          1: '#830EF9',
        },
        yellow: {
          1: '#F9A90E',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        'glass': 'blur(4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      backgroundImage: {
        hero: "url('/images/hero-background.png')",
        'grid-pattern': "linear-gradient(to right, #E2E8F0 1px, transparent 1px), linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)",
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

export default config;
