/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
    extend: {
      colors: {
        // ---- shadcn semantic tokens (driven by HSL CSS vars in globals.css) ----
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        // ---- LingRow brand palette (per Plan v2) ----
        brand: {
          blue:  '#2563EB',
          green: '#22C55E',
          gold:  '#F59E0B',
          bg:    '#060A1C',
          softbg:'#F8FAFF',
        },
        cosmic: {
          mint:    '#7ef7d3',
          sky:     '#5aa9ff',
          violet:  '#a59bff',
          purple:  '#8a4dff',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        twinkle: {
          '0%,100%': { opacity: '0.2', transform: 'scale(0.7)' },
          '50%':     { opacity: '1',   transform: 'scale(1.2)' },
        },
        drift: {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '50%':     { transform: 'translate(40px,-30px) scale(1.06)' },
        },
        floatY: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%,100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%':     { opacity: '1',   transform: 'scale(1.10)' },
        },
        spin360: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        twinkle:   'twinkle 3s ease-in-out infinite',
        drift:     'drift 22s ease-in-out infinite',
        floatY:    'floatY 6s ease-in-out infinite',
        glowPulse: 'glowPulse 2.6s ease-in-out infinite',
        spin360:   'spin360 6s linear infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
