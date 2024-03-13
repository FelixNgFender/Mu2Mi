import { siteConfig } from '@/config/site';
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: siteConfig.title,
        short_name: siteConfig.name,
        description: siteConfig.description,
        start_url: '/',
        display: 'standalone',
        background_color: '#333333',
        theme_color: '#333333',
        icons: [
            {
                src: '/icons/android-chrome-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/android-chrome-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
