import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/theme';

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const badgeVariants = {
  default: 'bg-gray-100 text-gray-800 border-gray-200',
  secondary: 'bg-blue-100 text-blue-800 border-blue-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-purple-100 text-purple-800 border-purple-200',
};

const badgeSizes = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ 
    className, 
    variant = 'default',
    size = 'md',
    icon,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 rounded-full border font-medium',
          badgeVariants[variant],
          badgeSizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {icon && <span>{icon}</span>}
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
