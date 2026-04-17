import { cn, statusColor } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}

export function Badge({ children, variant, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variant ? statusColor(variant) : 'bg-slate-100 text-slate-800',
        className,
      )}
    >
      {children}
    </span>
  );
}
