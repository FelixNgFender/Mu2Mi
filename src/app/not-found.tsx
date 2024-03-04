import { buttonVariants } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { httpStatus } from '@/lib/http';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function NotFound() {
    return (
        <section className="flex flex-1 flex-col items-center justify-center space-y-2 text-balance text-center">
            <h2 className="border-b pb-2 text-2xl font-semibold tracking-tight">
                {httpStatus.clientError.notFound.code} Not Found
            </h2>
            <p className="text-sm text-muted-foreground">
                {httpStatus.clientError.notFound.humanMessage}
            </p>
            <Link
                className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    '!mt-6',
                )}
                href={siteConfig.paths.home}
            >
                Back to home
            </Link>
        </section>
    );
}
