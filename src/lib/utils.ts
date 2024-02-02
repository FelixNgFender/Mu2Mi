import { type ClassValue, clsx } from 'clsx';
import { customAlphabet } from 'nanoid';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
const length = 15;

const nanoid = customAlphabet(alphabet, length);

export const generatePublicId = () => {
    return nanoid();
};
