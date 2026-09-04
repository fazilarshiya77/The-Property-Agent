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
        sans: ['Nunito', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // Marigold — the site's single accent color: primary CTAs,
        // active/selected states, links, badges, icons, key highlights.
        brand: {
          50: '#FDF6E7',
          100: '#FAE8C0',
          200: '#F5D287',
          300: '#F0BC4E',
          400: '#E9AF2E',
          500: '#E3A419', // Marigold
          600: '#BD850F',
          700: '#93670C',
          800: '#6E4D09',
          900: '#523A07',
        },
        // Marigold (same accent, kept as a separate token name for the
        // handful of places that reference it distinctly).
        gold: {
          50: '#FDF6E7',
          100: '#FAE8C0',
          200: '#F5D287',
          300: '#F0BC4E',
          400: '#E9AF2E',
          500: '#E3A419', // Marigold
          600: '#BD850F',
          700: '#93670C',
          800: '#6E4D09',
          900: '#523A07',
        },
        // Noctis — major dark sections, nav/footer, headings, premium contrast.
        navy: {
          50: '#EEEEF2',
          100: '#D6D7E0',
          200: '#AFB1C4',
          300: '#8184A3',
          400: '#585B80',
          500: '#3D4066',
          600: '#2E3050',
          700: '#262842',
          800: '#22243A',
          900: '#1F2235', // Noctis
          950: '#14151F',
        },
        // Light neutral / off-white — secondary background scale.
        beige: {
          50: '#FDFCFB',
          100: '#F7F7F9',
          200: '#EFEFF3',
          300: '#E7E7ED',
          400: '#D8D9E1',
          500: '#B9BAC7',
        },
        // Clean off-white / light-gray backgrounds, warming to Noctis at the
        // dark end for body/heading text.
        neutral: {
          50: '#F7F7F9', // primary background
          100: '#EFEFF3', // secondary background / highlights
          150: '#E7E7ED',
          200: '#D8D9E1',
          300: '#B9BAC7',
          400: '#9395A8',
          500: '#6F7185',
          600: '#54566A',
          700: '#3F4053',
          800: '#2A2B3B',
          900: '#1F2235',
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
