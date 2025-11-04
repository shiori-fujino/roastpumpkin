/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: '#ff00ff',
          cyan: '#00ffff',
          purple: '#a855f7',
          blue: '#3b82f6',
          green: '#00ff00',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'monospace'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'glow-trail': 'glow-trail 1s ease-out',
        'neon-flicker': 'neon-flicker 1.5s infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 20px #ff00ff',
          },
          '50%': {
            boxShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 40px #ff00ff, 0 0 60px #00ffff',
          },
        },
        'glow-trail': {
          '0%': {
            boxShadow: '0 0 0 0 rgba(255, 0, 255, 0.7)',
          },
          '100%': {
            boxShadow: '0 0 0 20px rgba(255, 0, 255, 0)',
          },
        },
        'neon-flicker': {
          '0%, 19%, 21%, 23%, 25%, 54%, 56%, 100%': {
            textShadow: '0 0 5px #ff00ff, 0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 40px #ff00ff',
          },
          '20%, 24%, 55%': {
            textShadow: 'none',
          },
        },
      },
    },
  },
  plugins: [],
}
