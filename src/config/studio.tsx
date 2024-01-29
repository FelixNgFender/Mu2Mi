import { MainNavItem, SidebarNavItem } from '@/types/nav';
import {
    Disc3,
    KeyboardMusic,
    Mic2,
    PencilLine,
    Speaker,
    Split,
} from 'lucide-react';

interface StudioConfig {
    mainNav: MainNavItem[];
    sidebarNav: SidebarNavItem[];
}

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

export const baseStudioPath = '/studio';

export const studioConfig: StudioConfig = {
    mainNav: [
        {
            title: 'Studio',
            href: baseStudioPath,
            icon: ({ className }) => <KeyboardMusic className={className} />,
        },
        {
            title: 'GitHub',
            href: 'https://github.com/FelixNgFender/Mu2Mi',
            external: true,
        },
    ],
    sidebarNav: [
        {
            title: 'Create',
            items: [
                {
                    title: 'Track Separation',
                    href: `${baseStudioPath}`,
                    items: [],
                    icon: ({ className }) => <Split className={className} />,
                },
                {
                    title: 'Voice Studio',
                    href: `${baseStudioPath}/voice`,
                    items: [],
                    icon: ({ className }) => <Mic2 className={className} />,
                },
                {
                    title: 'Mastering',
                    href: `${baseStudioPath}/mastering`,
                    items: [],
                    icon: ({ className }) => <Speaker className={className} />,
                },
                {
                    title: 'Lyrics Writer',
                    href: `${baseStudioPath}/lyrics`,
                    items: [],
                    icon: ({ className }) => (
                        <PencilLine className={className} />
                    ),
                },
            ],
        },
        {
            title: 'Recent Tracks',
            items: [
                ...tracks.map((track) => ({
                    title: track,
                    href: `/tracks/${track}`,
                    items: [],
                    icon: ({ className }: { className: string }) => (
                        <Disc3 className={className} />
                    ),
                })),
            ],
        },
    ],
};
