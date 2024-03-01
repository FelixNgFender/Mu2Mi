import { Toaster } from '@/components/ui/toaster';
import { env } from '@/config/env';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';
import { Open_Sans as FontSans } from 'next/font/google';

// import NextTopLoader from 'nextjs-toploader';
import './globals.css';
import QueryProvider from './query-provider';
import { SiteHeader } from './site-header';
import { TailwindIndicator } from './tailwind-indicator';
import { ThemeProvider } from './theme-provider';

const fontSans = FontSans({
    subsets: ['latin'],
    variable: '--font-sans',
});

export const metadata: Metadata = {
    metadataBase:
        env.NODE_ENV === 'development'
            ? new URL(env.ORIGIN)
            : new URL(siteConfig.url),
    title: {
        default: siteConfig.title,
        template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    applicationName: siteConfig.name,
    authors: siteConfig.authors,
    generator: 'Next.js',
    keywords: siteConfig.keywords,
    referrer: 'origin',
    creator: siteConfig.authors[0]?.name,
    publisher: siteConfig.authors[0]?.name,
    alternates: {
        canonical: siteConfig.url,
    },
    twitter: {
        card: 'summary_large_image',
        site: siteConfig.twitter.site,
        creator: siteConfig.twitter.creator,
        title: siteConfig.title,
        description: siteConfig.description,
        images: siteConfig.ogImage,
    },
    // TODO: finish this https://support.google.com/webmasters/answer/9008080#meta_tag_verification&zippy=%2Chtml-tag
    // verification: {
    //     google: '',
    //     yandex: '',
    //     me: '',
    // },
    category: siteConfig.category,
};

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={cn(
                    'min-h-screen bg-background font-sans antialiased',
                    fontSans.variable,
                )}
            >
                <QueryProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        {/* <NextTopLoader /> */}
                        <div className="relative flex min-h-screen flex-col bg-background">
                            <SiteHeader />
                            <main className="flex flex-1 flex-col">
                                {children}
                            </main>
                            {/* <SiteFooter /> */}
                        </div>
                        <TailwindIndicator />
                        <Toaster />
                    </ThemeProvider>
                </QueryProvider>
            </body>
        </html>
    );
}
