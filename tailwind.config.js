/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Indian Public Healthcare / CareLoop Palette
        gov: {
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d', // Primary medical action green
            800: '#166534', // Dark green branding / primary button
            900: '#14532d', // Deepest green for header / high emphasis
            950: '#052e16',
          },
          surface: '#f8faf9', // Very light neutral/green tint background
          card: '#ffffff',
          border: '#e2e8f0',
          'border-subtle': '#cbd5e1',
          'text-primary': '#0f172a',   // Dark slate for high contrast readability
          'text-secondary': '#475569', // Muted slate
          'text-muted': '#64748b',
          // Semantic statuses for public healthcare triage
          status: {
            success: '#15803d',     // Completed / Confirmed
            'success-bg': '#dcfce7',
            warning: '#b45309',     // Pending / Awaiting Confirmation
            'warning-bg': '#fef3c7',
            error: '#b91c1c',       // Gap Detected / Critical
            'error-bg': '#fee2e2',
            emergency: '#dc2626',   // Emergency Referral
            'emergency-bg': '#fef2f2',
            info: '#0369a1',        // In Tracking / Dispatched
            'info-bg': '#e0f2fe',
            neutral: '#475569',
            'neutral-bg': '#f1f5f9',
          }
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'gov-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'gov-card': '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'gov-md': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'gov': '0.375rem',
        'gov-lg': '0.5rem',
      },
    },
  },
  plugins: [],
}
