import Link from 'next/link';
import { cn } from '@/lib/utils';

const variantStyles: Record<string, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/80',
  outline: 'border border-border bg-background hover:bg-muted text-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-muted text-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
};

const sizeStyles: Record<string, string> = {
  default: 'h-8 px-2.5 text-sm',
  sm: 'h-7 px-2.5 text-xs rounded-md',
  lg: 'h-9 px-4 text-sm',
  icon: 'size-8',
};

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  className?: string;
}

export function ButtonLink({
  href,
  children,
  variant = 'default',
  size = 'default',
  className,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </Link>
  );
}
