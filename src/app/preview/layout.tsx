import { siteConfig } from '@/config/site';
import { Metadata } from 'next';

type TrackLayoutProps = {
    children: React.ReactNode;
};

export const metadata: Metadata = {
    title: 'Preview',
    description: `Check out what I just made on ${siteConfig.name}!`,
};

const TrackLayout = ({ children }: TrackLayoutProps) => {
    return (
        <section className="container relative flex h-full flex-1 flex-col space-y-4 py-4">
            {children}
        </section>
    );
};

export default TrackLayout;
