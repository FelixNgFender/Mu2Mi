import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getPageSession } from '@/server/auth';
import { LogIn, LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

interface ModeToggleProps {
    variant?:
        | 'default'
        | 'link'
        | 'destructive'
        | 'outline'
        | 'secondary'
        | 'ghost'
        | null
        | undefined;
    className?: string | undefined;
    size?: 'default' | 'sm' | 'lg' | 'icon' | null | undefined;
}

export const Account = async ({
    variant = 'outline',
    className,
    size = 'icon',
}: ModeToggleProps) => {
    const session = await getPageSession();
    // if (!session) redirect('/auth/sign-in');
    // if (session.user.emailVerified) redirect('/');
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} className={className} size={size}>
                    <User className="h-5 w-5" />
                    <span className="sr-only">Manage account</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {session && (
                    <DropdownMenuItem>
                        <Link href="/settings" className="flex flex-1">
                            <Settings className="mr-2 h-5 w-5" />
                            Settings
                        </Link>
                    </DropdownMenuItem>
                )}
                {!session && (
                    <DropdownMenuItem>
                        <Link href="/auth/sign-in" className="flex flex-1">
                            <LogIn className="mr-2 h-5 w-5" />
                            Sign in
                        </Link>
                    </DropdownMenuItem>
                )}
                {session && (
                    <DropdownMenuItem>
                        <LogOut className="mr-2 h-5 w-5" />
                        <form action="/api/auth/sign-out" method="post">
                            <input type="submit" value="Sign out" />
                        </form>
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
