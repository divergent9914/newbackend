import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number as currency (default: INR)
 * @param amount - The amount to format
 * @param locale - The locale to use for formatting (default: 'en-IN')
 * @param currency - The currency code (default: 'INR')
 * @returns A formatted currency string
 */
export function formatCurrency(
  amount: number, 
  locale: string = 'en-IN', 
  currency: string = 'INR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}