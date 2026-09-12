/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#F7F8F6",
        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F1F3F0",
        },
        carbon: {
          primary: "#17201A",
          secondary: "#68736C",
          muted: "#89928C",
        },
        border: {
          DEFAULT: "#E3E7E3",
          subtle: "#ECEFEC",
        },
        brand: {
          primary: "#16794A",
          dark: "#0F5A36",
          soft: "#E7F4EC",
          bright: "#25A866",
        },
        status: {
          blue: "#3B82F6",
          amber: "#D99422",
          red: "#C95151",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'control': '6px',
        'btn': '8px',
        'card': '12px',
        'container': '14px',
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
        'float': '0 4px 12px rgba(23, 32, 26, 0.08)',
        'modal': '0 12px 32px rgba(23, 32, 26, 0.12)',
      }
    },
  },
  plugins: [],
}
