import { Icons } from '@/components/icons';
import { MainNavItem, SidebarNavItem } from '@/types/studio';
import {
    Activity,
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

export const studioConfig: StudioConfig = {
    mainNav: [
        {
            title: 'Studio',
            href: siteConfig.paths.studio.home,
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
                    title: 'Music Generation',
                    href: siteConfig.paths.studio.musicGeneration,
                    items: [],
                    icon: <BrainCircuit />,
                },
                {
                    title: 'Style Remix',
                    href: siteConfig.paths.studio.styleRemix,
                    items: [],
                    icon: <Disc3 />,
                },
            ],
        },
        {
            title: 'Analyze',
            items: [
                {
                    title: 'Track Separation',
                    href: siteConfig.paths.studio.trackSeparation,
                    items: [],
                    icon: <Split />,
                },
                {
                    title: 'Track Analysis',
                    href: siteConfig.paths.studio.trackAnalysis,
                    items: [],
                    icon: <Activity />,
                },
                {
                    title: 'MIDI Transcription',
                    href: siteConfig.paths.studio.midiTranscription,
                    items: [],
                    icon: <FileMusic />,
                },
                {
                    title: 'Lyrics Transcription',
                    href: siteConfig.paths.studio.lyricsTranscription,
                    items: [],
                    icon: <Mic2 />,
                },
            ],
        },
        {
            title: 'Preview',
            items: [
                {
                    title: 'Audio Preview',
                    href: siteConfig.paths.studio.preview.track,
                    items: [],
                    icon: <Disc3 />,
                },
                {
                    title: 'MIDI Preview',
                    href: siteConfig.paths.studio.preview.midi,
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
