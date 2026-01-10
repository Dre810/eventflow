/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4361ee',
        'primary-dark': '#3a56d4',
        secondary: '#7209b7',
        success: '#4cc9f0',
        danger: '#f72585',
        warning: '#f8961e',
        dark: '#212529',
        light: '#f8f9fa',
        gray: '#6c757d',
        'light-gray': '#e9ecef',
      },
      borderRadius: {
        'radius': '12px',
      },
      boxShadow: {
        'shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      transitionProperty: {
        'transition': 'all 0.3s ease',
      },
    },
  },
  plugins: [],
}