import { Icons } from '@/components/icons';
import { MainNavItem, SidebarNavItem } from '@/types/nav';
import {
    BrainCircuit,
    Disc3,
    FileAudio,
    FileMusic,
    KeyboardMusic,
    Mic2,
    Split,
} from 'lucide-react';

import { siteConfig } from './site';

interface StudioConfig {
    mainNav: MainNavItem[];
    sidebarNav: SidebarNavItem[];
}

export const baseStudioPath = '/studio';

export const studioConfig: StudioConfig = {
    mainNav: [
        {
            title: 'Studio',
            href: baseStudioPath,
            icon: <KeyboardMusic />,
        },
        {
            title: 'GitHub',
            href: siteConfig.links.github,
            external: true,
        },
        {
            title: 'Twitter',
            href: siteConfig.links.twitter,
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
                    icon: <Split />,
                },
                {
                    title: 'MIDI Transcription',
                    href: `${baseStudioPath}/midi`,
                    items: [],
                    icon: <FileMusic />,
                },
                {
                    title: 'Lyrics Transcription',
                    href: `${baseStudioPath}/lyrics`,
                    items: [],
                    icon: <Mic2 />,
                },
                {
                    title: 'Music Generation',
                    href: `${baseStudioPath}/generation`,
                    items: [],
                    icon: <BrainCircuit />,
                },
            ],
        },
        {
            title: 'Preview',
            items: [
                {
                    title: 'Audio Preview',
                    href: `${baseStudioPath}/track`,
                    items: [],
                    icon: <Disc3 />,
                },
                {
                    title: 'MIDI Preview',
                    href: `${baseStudioPath}/track/midi`,
                    items: [],
                    icon: <FileAudio />,
                },
            ],
        },
        {
            title: 'Connect',
            items: [
                {
                    title: 'GitHub',
                    href: siteConfig.links.github,
                    items: [],
                    external: true,
                    icon: <Icons.gitHub className="fill-current" />,
                },
                {
                    title: 'Twitter',
                    href: siteConfig.links.twitter,
                    items: [],
                    external: true,
                    icon: <Icons.twitter className="fill-current" />,
                },
            ],
        },
    ],
};
