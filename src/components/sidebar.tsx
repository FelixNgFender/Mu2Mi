import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Disc3, Mic2, PencilLine, Speaker, Split } from 'lucide-react';
import Link from 'next/link';

const tracks = [
    'Magic',
    'NIGHT DANCER',
    'Kura Kura',
    'KICK BACK',
    'Kizuna no Kiseki',
    '夜に駆ける',
    'Stay With Me',
    'Mixed Nuts',
    'Inferno',
    'Que Sera Sera',
    'Show',
    'Shinunoga E-Wa',
    'LADY',
    'だから僕は音楽を辞めた',
    'ミズキリ',
    '月色ホライズン',
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

const links = [
    {
        name: 'Track Separation',
        href: '/',
        icon: <Split className="mr-2 h-4 w-4" />,
    },
    {
        name: 'Voice Studio',
        href: '/voice',
        icon: <Mic2 className="mr-2 h-4 w-4" />,
    },
    {
        name: 'Mastering',
        href: '/mastering',
        icon: <Speaker className="mr-2 h-4 w-4" />,
    },
    {
        name: 'Lyrics Writer',
        href: '/lyrics',
        icon: <PencilLine className="mr-2 h-4 w-4" />,
    },
];

export const Sidebar = async ({ className }: SidebarProps) => {
    const recentTracks = tracks; // TODO: fetch recent tracks here, this is a Server Component
    return (
        <div className={cn('pb-12', className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Create
                    </h2>
                    <div className="space-y-1">
                        {links.map(({ name, href, icon }) => (
                            <Link
                                key={name}
                                href={href}
                                className={cn(
                                    buttonVariants({ variant: 'ghost' }),
                                    'w-full justify-start',
                                )}
                            >
                                {icon}
                                {name}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="py-2">
                    <h2 className="relative px-7 text-lg font-semibold tracking-tight">
                        Recent Tracks
                    </h2>
                    <ScrollArea className="h-[300px] px-1">
                        <div className="space-y-1 p-2">
                            {recentTracks?.map((recentTrack, i) => (
                                <Button
                                    key={`${recentTrack}-${i}`}
                                    variant="ghost"
                                    className="w-full justify-start font-normal"
                                >
                                    <Disc3 className="mr-2 h-4 w-4" />
                                    {recentTrack}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
};
