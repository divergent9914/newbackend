import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: string | number): string {
  const amount = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDateTime(date: string | Date): string {
  return `${formatDate(date)}, ${formatTime(date)}`;
}

export function getDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

export function getTimeSlotLabel(startTime: string | Date, endTime: string | Date): string {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateOrderNumber(): string {
  const prefix = 'AAMIS';
  const randomPart = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  const timestamp = new Date().getTime().toString().slice(-6);
  return `${prefix}-${randomPart}-${timestamp}`;
}

/**
 * Calculate delivery fee based on distance, order value, and subscription status
 * @param distance Distance in kilometers
 * @param orderValue Order value in rupees
 * @param hasSubscription Whether the user has a subscription
 * @returns Promise resolving to the calculated delivery fee
 */
export async function calculateDeliveryFee(
  distance: number,
  orderValue: number,
  hasSubscription: boolean = false
): Promise<number> {
  try {
    const response = await fetch('/api/delivery-fee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        distance,
        orderValue,
        hasSubscription
      })
    });

    if (!response.ok) {
      throw new Error('Failed to calculate delivery fee');
    }

    const data = await response.json();
    return data.deliveryFee;
  } catch (error) {
    console.error('Error calculating delivery fee:', error);
    
    // Fallback calculation in case of API failure
    const baseFreeRadius = 1;
    const platformFee = 2;
    
    let fee = 0;
    if (distance > baseFreeRadius) {
      if (hasSubscription && distance <= 5) {
        fee = 0;
      } else if (orderValue >= 500) {
        fee = distance <= 5 ? 0 : 45;
      } else if (orderValue >= 300) {
        fee = distance <= 5 ? 15 : 50;
      } else if (distance <= 3) {
        fee = 25;
      } else if (distance <= 5) {
        fee = 40;
      } else if (distance <= 8) {
        fee = 60;
      } else {
        fee = 75;
      }
    }
    
    return fee + platformFee;
  }
}
