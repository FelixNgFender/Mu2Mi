import { Button, buttonVariants } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { getUserSession } from '@/models/user';
import { LogIn, LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';

import { signOut } from './actions';

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
                <Button
                    variant={variant}
                    className={className}
                    size={size}
                    title="Account"
                >
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
                    <form action={signOut} className="flex flex-1">
                        <button className="flex flex-1">
                            <LogOut className="mr-2 h-5 w-5" />
                            Sign out
                        </button>
                    </form>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
