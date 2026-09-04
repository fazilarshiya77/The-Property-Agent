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
        // Turquoise — controlled accent for primary CTAs, active/selected
        // states, links, and key highlights. Never used for large fills.
        brand: {
          50: '#E9FBF9',
          100: '#C9F3EE',
          200: '#96E6DC',
          300: '#5FD6C8',
          400: '#34CDBC',
          500: '#23C7B9', // Turquoise
          600: '#1BA79B',
          700: '#158679',
          800: '#12665D',
          900: '#0F4C45',
        },
        // Cinnamon / Terracotta — supporting accent for labels, icons,
        // badges, and secondary highlights.
        gold: {
          50: '#FBF3EE',
          100: '#F3E0D2',
          200: '#E5C1A8',
          300: '#D49F7C',
          400: '#BD8365',
          500: '#A36B4A', // Cinnamon / Terracotta
          600: '#8A563A',
          700: '#6E432D',
          800: '#553425',
          900: '#40271C',
        },
        // Deep Coffee — major dark sections, nav/footer, headings, premium contrast.
        navy: {
          50: '#F7EDEA',
          100: '#EDD5CE',
          200: '#D8AB9E',
          300: '#BE7E6B',
          400: '#9E5943',
          500: '#7E3F30',
          600: '#602E24',
          700: '#4A241C',
          800: '#3A1B15',
          900: '#2E0D14', // Deep Coffee
          950: '#1A0509',
        },
        // Warm Sand — secondary background / subtle-highlight scale.
        beige: {
          50: '#FFFBF5',
          100: '#FFF3E0',
          200: '#FFE7C2',
          300: '#FFECD1', // Warm Sand
          400: '#F0C896',
          500: '#DDA96A',
        },
        // Almond / Cream (50-100 = primary + secondary backgrounds), warming
        // to Deep Coffee at the dark end for body/heading text.
        neutral: {
          50: '#EFE1D5', // Almond / Cream — primary background
          100: '#FFECD1', // Warm Sand — secondary background / highlights
          150: '#F5DEC0',
          200: '#E8D2B8',
          300: '#D3B594',
          400: '#B8916D',
          500: '#96704F',
          600: '#7A5740',
          700: '#5C4131',
          800: '#3F2C22',
          900: '#2E0D14',
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
