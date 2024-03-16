import { Account } from './account';
import { CommandMenu } from './command-menu';
import { CreditBadge } from './credit-badge';
import { MainNav } from './main-nav';
import { MobileNav } from './mobile-nav';
import { ModeToggle as ThemeToggle } from './theme-toggle';

export const SiteHeader = async () => {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 max-w-screen-2xl items-center">
                <MainNav />
                <MobileNav />
                <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end md:space-x-4">
                    <div className="w-full flex-1 md:w-auto md:flex-none">
                        <CommandMenu />
                    </div>
                    <CreditBadge />
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
                        <Account className="h-9 w-9 px-0" />
                    </nav>
                </div>
            </div>
        </header>
    );
};
