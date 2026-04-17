import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function statusColor(status: string): string {
  switch (status) {
    case 'PAID':
    case 'SUCCESS':
    case 'ACCEPTED':
      return 'bg-emerald-100 text-emerald-800';
    case 'OVERDUE':
    case 'FAILED':
    case 'EXPIRED':
      return 'bg-red-100 text-red-800';
    case 'PARTIALLY_PAID':
    case 'PENDING':
      return 'bg-amber-100 text-amber-800';
    case 'UPCOMING':
      return 'bg-sky-100 text-sky-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
}
