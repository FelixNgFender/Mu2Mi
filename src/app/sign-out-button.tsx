'use client';

import { useToast } from '@/components/ui/use-toast';
import { LogOut } from 'lucide-react';

import { signOut } from './actions';

export const SignOutButton = () => {
    const { toast } = useToast();
    return (
        <button
            onClick={async () => {
                const result = await signOut();
                if (!result) return;
                if (!result.success) {
                    toast({
                        variant: 'destructive',
                        title: 'Uh oh! Something went wrong.',
                        description: result.error,
                    });
                }
            }}
            className="flex flex-1"
        >
            <LogOut className="mr-2 h-5 w-5" />
            Sign out
        </button>
    );
};
