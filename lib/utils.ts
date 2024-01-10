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

export const hslToRgb = (h: number, s: number, l: number) => {
    let r: number, g: number, b: number;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hueToRgb(p, q, h + 1 / 3);
        g = hueToRgb(p, q, h);
        b = hueToRgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

export const hueToRgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
};
