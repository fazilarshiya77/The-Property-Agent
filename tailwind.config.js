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
        // Faded Copper — the site's single accent color: primary CTAs,
        // active/selected states, links, badges, icons, key highlights.
        brand: {
          50: '#FAF4EF',
          100: '#F3E5D9',
          200: '#E5CBB4',
          300: '#D3AD8C',
          400: '#C0996F',
          500: '#AC8563', // Faded Copper
          600: '#8F6C4E',
          700: '#71553D',
          800: '#57412F',
          900: '#413021',
        },
        // Faded Copper (same accent, kept as a separate token name for the
        // handful of places that reference it distinctly).
        gold: {
          50: '#FAF4EF',
          100: '#F3E5D9',
          200: '#E5CBB4',
          300: '#D3AD8C',
          400: '#C0996F',
          500: '#AC8563', // Faded Copper
          600: '#8F6C4E',
          700: '#71553D',
          800: '#57412F',
          900: '#413021',
        },
        // Evergreen — major dark sections, nav/footer, headings, premium contrast.
        navy: {
          50: '#EAF3F1',
          100: '#CCE3DE',
          200: '#9BC7BE',
          300: '#699F94',
          400: '#437D72',
          500: '#2C5C53',
          600: '#1F463F',
          700: '#173530',
          800: '#122A26',
          900: '#0C2320', // Evergreen
          950: '#081714',
        },
        // Light honeydew-adjacent secondary background scale.
        beige: {
          50: '#FBFDFC',
          100: '#F2F8F4',
          200: '#E4F1E8',
          300: '#D2E7D9',
          400: '#AFD1B9',
          500: '#8FBC9C',
        },
        // Honeydew (50-100 = primary + secondary backgrounds), warming to
        // Evergreen at the dark end for body/heading text.
        neutral: {
          50: '#E4F1E8', // Honeydew — primary background
          100: '#D2E7D9', // secondary background / highlights
          150: '#C3DECB',
          200: '#AFD1B9',
          300: '#8FBC9C',
          400: '#6B9E7E',
          500: '#4F7F62',
          600: '#3D654E',
          700: '#2E4D3C',
          800: '#20362A',
          900: '#0C2320',
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
