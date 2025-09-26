// Unified theme configuration for GhostPalace
export const theme = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
    }
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  }
};

// Component style classes using the theme
export const themeClasses = {
  // Layout
  page: 'min-h-screen bg-gray-50',
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  
  // Navigation
  nav: 'bg-white shadow-sm border-b border-blue-200',
  navHeight: 'h-16',
  navLink: 'text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors',
  navLinkActive: 'bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium',
  
  // Buttons
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors',
    secondary: 'border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium transition-colors',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors',
    danger: 'bg-red-600 hover:bg-red-700 text-white font-medium transition-colors',
    success: 'bg-green-600 hover:bg-green-700 text-white font-medium transition-colors',
  },
  
  // Cards
  card: 'bg-white rounded-lg shadow-sm border border-blue-200',
  cardHover: 'bg-white rounded-lg shadow-sm border border-blue-200 hover:shadow-md hover:border-blue-300 transition-all',
  cardPadding: 'p-6',
  
  // Forms
  input: 'w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
  label: 'block text-sm font-medium text-gray-700 mb-2',
  
  // Text
  heading: {
    h1: 'text-3xl font-bold text-gray-900',
    h2: 'text-2xl font-bold text-gray-900',
    h3: 'text-xl font-semibold text-gray-900',
    h4: 'text-lg font-semibold text-gray-900',
  },
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
    accent: 'text-blue-600',
  },
  
  // Status
  status: {
    active: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    disputed: 'bg-red-100 text-red-800 border-red-200',
    cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    funds_locked: 'bg-purple-100 text-purple-800 border-purple-200',
    in_dispute: 'bg-orange-100 text-orange-800 border-orange-200',
    delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  }
};

// Utility function to combine classes
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
