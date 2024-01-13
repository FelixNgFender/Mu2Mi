import { MainNavItem } from '@/lib/types/nav';

interface StudioConfig {
    mainNav: MainNavItem[];
}

export const studioConfig: StudioConfig = {
    mainNav: [
        {
            title: 'Studio',
            href: '/',
        },
        {
            title: 'GitHub',
            href: 'https://github.com/FelixNgFender/Mu2Mi',
            external: true,
        },
    ],
};
