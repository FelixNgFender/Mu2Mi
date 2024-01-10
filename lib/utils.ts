import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Converts a string to a boolean. Undefined returns false.
 */
export const stringToBoolean = (str: string | undefined) => {
    if (!str) return false;
    if (str === 'true') return true;
    if (str === 'false') return false;
    if (str === 'True') return true;
    if (str === 'False') return false;
    if (str === 'TRUE') return true;
    if (str === 'FALSE') return false;
    return false;
};
