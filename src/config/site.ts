export const siteConfig = {
    authors: [
        { name: 'Felix Nguyen', content: 'https://github.com/FelixNgFender' },
    ],
    name: 'Mu2Mi',
    title: 'Mu2Mi - The AI Musical Toolkit.',
    url: 'https://mu2mi.com',
    ogImage: 'https://mu2mi.com/opengraph-image.png',
    description:
        'Elevate your music practice with our open-source, AI-powered app. Remove vocals, isolate instruments, transcribe lyrics and instruments, generate and remix songs.',
    links: {
        github: 'https://github.com/FelixNgFender/Mu2Mi',
        twitter: 'https://twitter.com/felixcantcode',
    },
    twitter: {
        site: '@felixcantcode',
        creator: '@felixcantcode',
    },
    keywords: ['music', 'production', 'ai', 'vocals', 'instruments', 'lyrics'],
    category: 'technology',
};

export type SiteConfig = typeof siteConfig;
