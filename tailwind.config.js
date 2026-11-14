/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          950: '#030712',
          900: '#070d1e',
          850: '#0b132b',
          800: '#0f172a',
          700: '#1e293b',
          600: '#334155',
        },
        telemetry: {
          cyan: '#06b6d4',
          cyanGlow: '#22d3ee',
          green: '#10b981',
          greenGlow: '#34d399',
          amber: '#f59e0b',
          amberGlow: '#fbbf24',
          red: '#ef4444',
          redGlow: '#f87171',
          violet: '#8b5cf6',
          violetGlow: '#a78bfa',
          blue: '#3b82f6',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
        orbitron: ['"Orbitron"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite',
        'radar': 'radar 4s linear infinite',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
