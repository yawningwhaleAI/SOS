import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        signal: {
          DEFAULT: '#F03E12',
          bright: '#FF5A1F',
          deep: '#C62E0B',
        },
        bone: {
          DEFAULT: '#F2EDE3',
          dim: '#E7E0D2',
        },
        ink: {
          DEFAULT: '#111111',
          soft: '#1C1A17',
        },
        bamboo: '#3F6B4A',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Impact', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        stencil: ['var(--font-stencil)', 'Impact', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      letterspacing: {},
      maxWidth: {
        wide: '96rem',
      },
      transitionTimingFunction: {
        sos: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        },
        'hazard-slide': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '56px 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        blink: 'blink 1.4s steps(1, end) infinite',
        'hazard-slide': 'hazard-slide 1.2s linear infinite',
        marquee: 'marquee 32s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
