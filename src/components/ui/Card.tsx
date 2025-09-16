import { ReactNode } from 'react';
import { cn } from '@/lib/client-utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  pressed?: boolean;
}

export function Card({ children, className, hover = false, pressed = false }: CardProps) {
  return (
    <div
      className={cn(
        'section-neumorphic',
        hover && '',
        pressed && 'shadow-inner',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4 p-6 pb-2', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-800', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('text-gray-600 p-6 pt-0', className)}>
      {children}
    </div>
  );
}
