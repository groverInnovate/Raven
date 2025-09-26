import { ReactNode } from 'react';
import Navigation from '../Navigation';
import { cn } from '../../lib/theme';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  showNavigation?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-8xl',
  '2xl': 'max-w-9xl',
  full: 'max-w-full',
};

export default function PageLayout({
  children,
  className,
  containerClassName,
  showNavigation = true,
  maxWidth = 'lg'
}: PageLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      {showNavigation && <Navigation />}
      <main className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8 py-8',
        maxWidthClasses[maxWidth],
        containerClassName
      )}>
        {children}
      </main>
    </div>
  );
}
