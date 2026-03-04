import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get a color for a severity band — used in charts and badges.
 */
export function getSeverityColor(band: string): string {
  const colors: Record<string, string> = {
    MINIMAL: '#22c55e',
    NORMAL: '#22c55e',
    NEGATIVE_SCREEN: '#22c55e',
    MILD: '#eab308',
    LOW: '#eab308',
    SUBTHRESHOLD: '#eab308',
    MODERATE: '#f97316',
    MODERATELY_SEVERE: '#ef4444',
    SEVERE: '#dc2626',
    EXTREMELY_SEVERE: '#991b1b',
    HIGH: '#ef4444',
    POOR: '#ef4444',
    POSITIVE_SCREEN: '#f97316',
    CRISIS: '#7f1d1d',
  };
  return colors[band] || '#6b7280';
}

/**
 * Get a risk level color.
 */
export function getRiskColor(level: string): string {
  const colors: Record<string, string> = {
    NONE: '#22c55e',
    LOW: '#eab308',
    MODERATE: '#f97316',
    HIGH: '#ef4444',
    CRISIS: '#7f1d1d',
  };
  return colors[level] || '#6b7280';
}
