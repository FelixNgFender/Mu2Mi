'use client';

import { siteConfig } from '@/config/site';
import { baseStudioPath } from '@/config/studio';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export function MainNav() {
    return (
        <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
                <Image
                    width={24}
                    height={24}
                    className="mr-2"
                    src="/icons/favicon-32x32.png"
                    alt="logo"
                />
                <span className="hidden font-bold sm:inline-block">
                    {siteConfig.name}
                </span>
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
