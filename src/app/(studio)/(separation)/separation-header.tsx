'use client';

import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import { studioConfig } from '@/lib/configs/studio';
import { cn } from '@/lib/utils';
import { LucideUpload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export const SeparationHeader = () => {
    const router = useRouter();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (
                (e.metaKey || e.ctrlKey) &&
                e.shiftKey &&
                e.key.toLowerCase() === 'f'
            ) {
                if (
                    (e.target instanceof HTMLElement &&
                        e.target.isContentEditable) ||
                    e.target instanceof HTMLInputElement ||
                    e.target instanceof HTMLTextAreaElement ||
                    e.target instanceof HTMLSelectElement
                ) {
                    return;
                }

                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = useCallback((command: () => unknown) => {
        setOpen(false);
        command();
    }, []);

    return (
        <>
            <div className="flex w-full items-end justify-between">
                <h1 className="text-lg font-extrabold tracking-tight lg:text-xl">
                    Track Separation
                </h1>
                <Link
                    href="/separation/new"
                    className={cn(buttonVariants({ variant: 'default' }))}
                >
                    <LucideUpload className="mr-2 h-4 w-4" />
                    Upload Track
                </Link>
            </div>
        </>
    );
};
