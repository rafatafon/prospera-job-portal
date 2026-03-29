import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { toDateLocale } from "@/lib/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(toDateLocale(locale), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateLong(dateStr: string, locale: string) {
  return new Date(dateStr).toLocaleDateString(toDateLocale(locale), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
