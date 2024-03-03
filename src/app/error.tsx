'use client';

import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // The `digest` property is a unique identifier for the error
        // that can be used to look up the error in the server-side logs.
        console.error(error);
    }, [error]);

    return (
        <section className="flex flex-1 flex-col items-center justify-center space-y-2 text-balance text-center">
            <h2 className="border-b pb-2 text-2xl font-semibold tracking-tight">
                Uh oh! Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground">
                {error.message || 'An unexpected error occurred.'}
            </p>
            <Button
                variant="outline"
                size="lg"
                className="!mt-6"
                onClick={
                    // Attempt to recover by trying to re-render
                    () => reset()
                }
            >
                Try again
            </Button>
        </section>
    );
}
