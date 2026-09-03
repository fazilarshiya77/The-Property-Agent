/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        sans: ['Roboto', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          50: '#FBF7EE',
          100: '#F5EBD3',
          200: '#EAD7A8',
          300: '#DEC17F',
          400: '#D3B26B',
          500: '#C6A75E', // Soft Gold
          600: '#AD8F4C',
          700: '#8C743D',
          800: '#6D5A30',
          900: '#544526',
        },
        gold: {
          50: '#FBF7EE',
          100: '#F5EBD3',
          200: '#EAD7A8',
          300: '#DEC17F',
          400: '#D3B26B',
          500: '#C6A75E', // Soft Gold
          600: '#AD8F4C',
          700: '#8C743D',
          800: '#6D5A30',
          900: '#544526',
        },
        navy: {
          50: '#EEF1F6',
          100: '#DDE3EC',
          200: '#BFC9DA',
          300: '#97A5C0',
          400: '#6C7CA0',
          500: '#4B5A80',
          600: '#374468',
          700: '#2A3454',
          800: '#232C48',
          900: '#1F2A44', // Navy
          950: '#141B2E',
        },
        beige: {
          50: '#FDFBF7',
          100: '#F8F3EA',
          200: '#F1E8D6',
          300: '#E8DCC8', // Warm Beige
          400: '#DBC8A8',
          500: '#C9AF83',
        },
        neutral: {
          50: '#FAF7F1',
          100: '#F3EDE2',
          150: '#EBE3D3',
          200: '#DFD5C0',
          300: '#C1B7A3',
          400: '#A59D8B',
          500: '#8A8272',
          600: '#6B655A',
          700: '#504C44',
          800: '#34302B',
          900: '#1F2A44',
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'count-up': 'countUp 0.6s ease-out forwards',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 12px 32px rgba(0,0,0,0.1)',
        'nav': '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.04)',
        'glass': '0 8px 32px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [],
};
