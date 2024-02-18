import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatValidationErrors = (
    errors: Partial<Record<string, string[]>>,
): string => {
    return Object.entries(errors)
        .map(([key, value]) => `${key}: ${value?.join(', ') ?? ''}`)
        .join(', ');
};
