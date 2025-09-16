import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/client-utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          className={cn(
            'w-full px-3 py-2 neumorphic-input bg-white rounded-lg border-0 shadow-neumorphic-inset',
            'focus:shadow-neumorphic-inset-focus focus:outline-none transition-all duration-200',
            'placeholder:text-gray-400 text-gray-700',
            error && 'shadow-red-200',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
