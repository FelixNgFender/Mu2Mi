import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { studioConfig } from '@/config/studio';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface StudioSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export const StudioSidebar = async ({ className }: StudioSidebarProps) => {
    const links = studioConfig.sidebarNav.find((nav) => nav.title === 'Create')
        ?.items;
    const recentTracks = studioConfig.sidebarNav.find(
        (nav) => nav.title === 'Recent Tracks',
    )?.items;
    return (
        <div className={cn('pb-12', className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="text-md mb-2 px-4 font-semibold tracking-tight lg:text-lg">
                        Create
                    </h2>
                    <div className="space-y-1">
                        {links?.map(({ title, href, icon }) => (
                            <Link
                                key={href}
                                href={href || '/'}
                                className={cn(
                                    buttonVariants({ variant: 'ghost' }),
                                    'w-full justify-start text-xs lg:text-sm',
                                )}
                            >
                                {icon &&
                                    icon({
                                        className:
                                            'mr-2 h-4 w-4 hidden lg:block',
                                    })}
                                {title}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="py-2">
                    <h2 className="text-md relative px-7 font-semibold tracking-tight lg:text-lg">
                        Recent Tracks
                    </h2>
                    <ScrollArea className="h-96 px-1">
                        <div className="space-y-1 p-2">
                            {recentTracks?.map((recentTrack, i) => (
                                <Button
                                    key={`${recentTrack.title}-${i}`}
                                    variant="ghost"
                                    className="w-full justify-start text-xs font-normal lg:text-sm"
                                >
                                    {recentTrack.icon &&
                                        recentTrack.icon({
                                            className:
                                                'mr-2 h-4 w-4 hidden lg:block',
                                        })}
                                    {recentTrack.title}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
};
