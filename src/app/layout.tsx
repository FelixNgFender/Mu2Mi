import { Toaster } from '@/components/ui/toaster';
import { env } from '@/config/env';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';
import { Open_Sans as FontSans } from 'next/font/google';
import Script from 'next/script';

// import NextTopLoader from 'nextjs-toploader';
import './globals.css';
import QueryProvider from './query-provider';
import { SiteHeader } from './site-header';
import { TailwindIndicator } from './tailwind-indicator';
import { ThemeProvider } from './theme-provider';
import { WebVitals } from './web-vitals';

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
        images: `${siteConfig.url}/opengraph-image.png`,
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
                        {/* <Suspense fallback={<SplashScreen />}> */}
                        {/* <NextTopLoader /> */}
                        <div className="relative flex min-h-screen flex-col bg-background">
                            <SiteHeader />
                            <main className="flex flex-1 flex-col">
                                {children}
                            </main>
                            {/* <SiteFooter /> */}
                        </div>
                        {/* </Suspense> */}
                        <TailwindIndicator />
                        <Toaster />
                    </ThemeProvider>
                </QueryProvider>
                {env.ENABLE_ANALYTICS && <WebVitals />}
            </body>
            {env.ENABLE_ANALYTICS && (
                <Script
                    async
                    defer
                    src={env.UMAMI_SCRIPT_URL}
                    data-website-id={env.UMAMI_ANALYTICS_ID}
                />
            )}
        </html>
    );
}

// function SplashScreen() {
//     return (
//         <div className="fixed inset-0 flex items-center justify-center bg-background">
//             <Icons.mu2mi.dark.large className="animate hidden h-16 w-32 dark:block" />
//             <Icons.mu2mi.light.large className="block h-16 w-32 dark:hidden" />
//         </div>
//     );
// }
