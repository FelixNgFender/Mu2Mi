'use client';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideUpload } from 'lucide-react';
import Link from 'next/link';

export const MidiHeader = () => {
    return (
        <>
            <div className="flex w-full items-end justify-between">
                <h1 className="text-lg font-extrabold tracking-tight lg:text-xl">
                    MIDI Transcription
                </h1>
                <Link
                    href="midi/new"
                    className={cn(buttonVariants({ variant: 'default' }))}
                >
                    <LucideUpload className="mr-2 h-4 w-4" />
                    Upload Tracks
                </Link>
            </div>
        </>
    );
};
