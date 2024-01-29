'use client';

import { LogOut } from 'lucide-react';

import { signOut } from './actions';

export const SignOutButton = () => (
    <button
        onClick={async () => {
            await signOut();
        }}
        className="flex flex-1"
    >
        <LogOut className="mr-2 h-5 w-5" />
        Sign out
    </button>
);
