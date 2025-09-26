/**
 * Global Theme Configuration for GhostPalace
 * Ensures consistent light theme across all pages and components
 */

export const globalTheme = {
  // Base colors - Light theme only
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
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
    white: '#ffffff',
    black: '#000000',
  },
  
  // Component base classes - Light theme only
  components: {
    page: 'bg-white min-h-screen',
    container: 'bg-white',
    card: 'bg-white border border-gray-200 shadow-sm',
    text: {
      primary: 'text-gray-900',
      secondary: 'text-gray-600',
      muted: 'text-gray-500',
    },
    button: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
    },
    input: 'bg-white border border-gray-300 text-gray-900',
    modal: 'bg-white border border-gray-200',
  },
  
  // Layout classes
  layout: {
    navigation: 'bg-white border-b border-gray-200',
    sidebar: 'bg-white border-r border-gray-200',
    main: 'bg-gray-50',
  }
};

// Utility function to get consistent theme classes
export const getThemeClasses = (component: keyof typeof globalTheme.components) => {
  return globalTheme.components[component];
};

// Remove dark theme classes utility
export const removeDarkClasses = (className: string): string => {
  return className
    .split(' ')
    .filter(cls => !cls.startsWith('dark:'))
    .join(' ');
};

// Ensure light theme classes
export const ensureLightTheme = (className: string): string => {
  let classes = removeDarkClasses(className);
  
  // Add light theme defaults if not present
  if (!classes.includes('bg-') && !classes.includes('background')) {
    classes += ' bg-white';
  }
  
  if (!classes.includes('text-') && !classes.includes('color')) {
    classes += ' text-gray-900';
  }
  
  return classes.trim();
};
