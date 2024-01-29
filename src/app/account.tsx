import { Button, buttonVariants } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getUserSession } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { LogIn, LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';

import { SignOutButton } from './sign-out-button';

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
    const { session } = await getUserSession();
    if (!session)
        return (
            <Link
                href="/auth/sign-in"
                className={cn(buttonVariants({ variant: variant }), className)}
            >
                <LogIn className="h-5 w-5" />
                <span className="sr-only">Sign in</span>
            </Link>
        );
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} className={className} size={size}>
                    <User className="h-5 w-5" />
                    <span className="sr-only">Manage account</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem>
                    <Link href="/studio/settings" className="flex flex-1">
                        <Settings className="mr-2 h-5 w-5" />
                        Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <SignOutButton />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
