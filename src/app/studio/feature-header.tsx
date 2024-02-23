import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideUpload } from 'lucide-react';
import Link from 'next/link';

type FeatureHeaderProps = {
    title: string;
    href: string;
    ctaLabel: string;
};

export const FeatureHeader = ({
    title,
    href,
    ctaLabel,
}: FeatureHeaderProps) => {
    return (
        <>
            <div className="flex w-full items-end justify-between">
                <h1 className="text-lg font-extrabold tracking-tight lg:text-xl">
                    {title}
                </h1>
                <Link
                    href={href}
                    className={cn(buttonVariants({ variant: 'default' }))}
                >
                    <LucideUpload className="mr-2 h-4 w-4" />
                    {ctaLabel}
                </Link>
            </div>
        </>
    );
};
