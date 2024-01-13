import { Toaster } from '@/components/ui/toaster';
import { env } from '@/lib/env';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';

import './globals.css';
import { SiteHeader } from './site-header';
import { TailwindIndicator } from './tailwind-indicator';
import { ThemeProvider } from './theme-provider';

const fontSans = FontSans({
    subsets: ['latin'],
    variable: '--font-sans',
});

export const metadata: Metadata = {
    metadataBase: new URL(env.ORIGIN),
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
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <NextTopLoader />
                    <div className="relative flex min-h-screen flex-col bg-background">
                        <SiteHeader />
                        <main className="flex flex-1 flex-col">{children}</main>
                        {/* <SiteFooter /> */}
                    </div>
                    <TailwindIndicator />
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
