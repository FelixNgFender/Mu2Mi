'use client';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SidebarNavItem } from '@/types/studio';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface StudioSidebarNavProps {
    items: SidebarNavItem[];
}

export const StudioSidebar = ({ items }: StudioSidebarNavProps) => {
    const pathname = usePathname();
    return items.length ? (
        <div className="space-y-8 px-3 py-4">
            {items.map((item, index) => (
                <div key={index}>
                    <h4 className="text-md mb-2 px-4 font-semibold tracking-tight lg:text-lg">
                        {item.title}
                    </h4>
                    {item?.items?.length && (
                        <StudioSidebarNavItems
                            items={item.items}
                            pathname={pathname}
                        />
                    )}
                </div>
            ))}
        </div>
    ) : null;
};

interface StudioSidebarNavItemsProps {
    items: SidebarNavItem[];
    pathname: string | null;
}

export const StudioSidebarNavItems = ({
    items,
    pathname,
}: StudioSidebarNavItemsProps) => {
    return items?.length ? (
        <div className="grid grid-flow-row auto-rows-max space-y-1">
            {items.map(
                (item, index) =>
                    item.href && (
                        <Link
                            key={index}
                            href={item.href}
                            className={cn(
                                buttonVariants({
                                    variant: item.external
                                        ? 'link'
                                        : pathname === item.href
                                          ? 'default'
                                          : 'ghost',
                                }),
                                'w-full justify-start text-xs lg:text-sm',
                            )}
                            target={item.external ? '_blank' : ''}
                            rel={item.external ? 'noreferrer' : ''}
                        >
                            <div className="mr-2 hidden h-4 w-4 items-center justify-center lg:flex">
                                {item.icon}
                            </div>
                            {item.title}
                        </Link>
                    ),
            )}
        </div>
    ) : null;
};
