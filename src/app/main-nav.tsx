'use client';

import { Icons } from '@/components/icons';
import { siteConfig } from '@/config/site';
import { baseStudioPath } from '@/config/studio';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function MainNav() {
    return (
        <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-4 flex items-center">
                <Icons.mu2mi.dark.large className="hidden h-8 w-24 dark:block" />
                <Icons.mu2mi.light.large className="block h-8 w-24 dark:hidden" />
            </Link>
            <nav className="flex items-center gap-6 text-sm">
                <Link
                    href={baseStudioPath}
                    className="transition-colors hover:text-foreground/80"
                >
                    Studio
                </Link>
                <Link
                    href={siteConfig.links.github}
                    className={cn(
                        'text-foreground/60 transition-colors hover:text-foreground/80',
                    )}
                >
                    GitHub
                </Link>
            </nav>
        </div>
    );
}
