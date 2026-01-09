/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'], // Support data-theme attribute
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'var(--bg-color)',
          sidebar: 'var(--sidebar-bg)',
          card: 'var(--card-bg)',
          header: 'var(--header-bg)',
        },
        border: {
          card: 'var(--card-border)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          glow: 'var(--accent-glow)',
        },
        danger: 'var(--danger)',
        success: 'var(--success)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
      }
    },
  },
  plugins: [],
}
