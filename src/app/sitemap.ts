import { siteConfig } from '@/config/site';
import { MetadataRoute } from 'next';

function generateSitemapPaths(
    paths: any,
    baseUrl: string,
): MetadataRoute.Sitemap {
    const sitemapPaths: MetadataRoute.Sitemap = [];

    for (const key in paths) {
        const value = paths[key];

        if (typeof value === 'string') {
            sitemapPaths.push({
                url: `${baseUrl}${value}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.8,
            });
        } else {
            sitemapPaths.push(...generateSitemapPaths(value, baseUrl));
        }
    }

    return sitemapPaths;
}

export default function sitemap(): MetadataRoute.Sitemap {
    const sitemap: MetadataRoute.Sitemap = [
        {
            url: siteConfig.url,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 1,
        },
        ...generateSitemapPaths(siteConfig.paths, siteConfig.url),
    ];

    return sitemap;
}
