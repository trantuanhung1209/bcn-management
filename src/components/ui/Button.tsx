import { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/client-utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer';
  
  const variants = {
    primary: 'bg-blue-500 text-white shadow-neumorphic hover:shadow-neumorphic-hover active:shadow-neumorphic-pressed hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-700 shadow-neumorphic hover:shadow-neumorphic-hover active:shadow-neumorphic-pressed hover:bg-gray-300',
    danger: 'bg-red-500 text-white shadow-neumorphic hover:shadow-neumorphic-hover active:shadow-neumorphic-pressed hover:bg-red-600',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-800'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
