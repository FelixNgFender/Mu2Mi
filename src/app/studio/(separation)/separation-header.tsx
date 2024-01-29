'use client';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideUpload } from 'lucide-react';
import Link from 'next/link';

export const SeparationHeader = () => {
    return (
        <>
            <div className="flex w-full items-end justify-between">
                <h1 className="text-lg font-extrabold tracking-tight lg:text-xl">
                    Track Separation
                </h1>
                <Link
                    href="studio/new"
                    className={cn(buttonVariants({ variant: 'default' }))}
                >
                    <LucideUpload className="mr-2 h-4 w-4" />
                    Upload Track
                </Link>
            </div>
        </>
    );
};
