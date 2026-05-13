import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0A0A0A',
          800: '#141414',
          700: '#1F1F1F',
          600: '#2A2A2A',
        },
        paper: {
          DEFAULT: '#FFFFFF',
          soft: '#F6F5F2',
        },
        accent: {
          DEFAULT: '#1F7A3A',
          hover: '#2A9A4A',
          deep: '#155A2A',
        },
        sign: {
          green: '#1F7A3A',
          edge: '#0E4A22',
          rivet: '#E9E6DA',
        },
        accent2: '#1B3FF7',
        text: {
          700: '#2A2A2A',
          400: '#6B6B6B',
        },
        border: {
          DEFAULT: '#E6E4DD',
        },
        success: '#1FA866',
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-serif', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        'display-1': ['clamp(2.75rem, 6vw + 1rem, 6rem)', { lineHeight: '1.02', letterSpacing: '-0.025em' }],
        'display-2': ['clamp(2rem, 4vw + 1rem, 4rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'h1': ['clamp(2.25rem, 4vw + 0.5rem, 4.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'h2': ['clamp(1.75rem, 2.5vw + 0.5rem, 3rem)', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        'h3': ['clamp(1.25rem, 1vw + 0.75rem, 1.75rem)', { lineHeight: '1.2' }],
        'lead': ['clamp(1.05rem, 0.5vw + 0.85rem, 1.25rem)', { lineHeight: '1.5' }],
      },
      maxWidth: {
        site: '1280px',
      },
      spacing: {
        'section': '6rem',
        'section-sm': '4rem',
      },
      borderRadius: {
        pill: '999px',
      },
      animation: {
        'marquee': 'marquee 40s linear infinite',
        'fade-up': 'fade-up 0.6s ease-out both',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
