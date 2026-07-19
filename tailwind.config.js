/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Zimlo brand palette
        primary: {
          DEFAULT: '#FF9800', // Orange - primary brand color
          dark: '#E68600',
          light: '#FFB84D'
        },
        accent: {
          DEFAULT: '#FFC107', // Yellow - accent / highlights
          dark: '#E6AC00'
        },
        ink: '#212121', // near-black for text
        cream: '#FFF8F0' // warm background, softer than pure white
      },
      fontFamily: {
        // Baloo 2 has full Devanagari + Latin support and a friendly,
        // rounded personality that suits a food-delivery brand.
        display: ['"Baloo 2"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif']
      },
      borderRadius: {
        blob: '2rem'
      },
      boxShadow: {
        card: '0 4px 14px rgba(33, 33, 33, 0.08)',
        pop: '0 6px 20px rgba(255, 152, 0, 0.25)'
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(16px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        }
      },
      animation: {
        'slide-up': 'slide-up 0.25s ease-out'
      }
    }
  },
  plugins: []
}
