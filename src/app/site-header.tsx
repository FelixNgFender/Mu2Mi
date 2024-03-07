import { Badge } from '@/components/ui/badge';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card';

import { Account } from './account';
import { CommandMenu } from './command-menu';
import { MainNav } from './main-nav';
import { MobileNav } from './mobile-nav';
import { getUserCredits } from './queries';
import { ModeToggle as ThemeToggle } from './theme-toggle';

function formatTime(ms: number): string {
    const hours = Math.floor(ms / 1000 / 60 / 60);
    const minutes = Math.floor(ms / 1000 / 60);

    if (hours >= 1) {
        return `${hours.toString().padStart(2, '0')} hour${
            hours > 1 ? 's' : ''
        }`;
    } else {
        return `${Math.max(minutes, 1).toString().padStart(2, '0')} minute${
            minutes > 1 ? 's' : ''
        }`;
    }
}

export const SiteHeader = async () => {
    const { data: credits, serverError } = await getUserCredits({});

    if (serverError || !credits) {
        throw new Error(serverError);
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                <MainNav />
                <MobileNav />
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end md:space-x-4">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        <CommandMenu />
                    </div>
                    <HoverCard>
                        <HoverCardTrigger asChild>
                            <Badge
                                variant="secondary"
                                className="whitespace-nowrap"
                            >
                                Credit: {credits.remainingCredits}
                            </Badge>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-40 p-2 text-center text-sm font-semibold">
                            {credits.msBeforeNext > 0
                                ? `Reset in ${formatTime(credits.msBeforeNext)}`
                                : 'Starting fresh!'}
                        </HoverCardContent>
                    </HoverCard>
                    <nav className="flex items-center space-x-1">
                        {/* <Link
                            title={`${siteConfig.name} GitHub`}
                            href={siteConfig.links.github}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <div
                                className={cn(
                                    buttonVariants({
                                        variant: 'ghost',
                                    }),
                                    'h-9 w-9 px-0',
                                )}
                            >
                                <Icons.gitHub className="h-4 w-4 fill-current" />
                                <span className="sr-only">GitHub</span>
                            </div>
                        </Link>
                        <Link
                            title={`${siteConfig.name} X`}
                            href={siteConfig.links.twitter}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <div
                                className={cn(
                                    buttonVariants({
                                        variant: 'ghost',
                                    }),
                                    'h-9 w-9 px-0',
                                )}
                            >
                                <Icons.twitter className="h-4 w-4 fill-current" />
                                <span className="sr-only">Twitter</span>
                            </div>
                        </Link> */}
                        <ThemeToggle variant="ghost" className="h-9 w-9 px-0" />
                        <Account variant="ghost" className="h-9 w-9 px-0" />
                    </nav>
                </div>
            </div>
        </header>
    );
};
