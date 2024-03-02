import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { studioConfig } from '@/config/studio';
import { getUserSession } from '@/models/user';
import { trackModel } from '@/models/track';
import {
    HydrationBoundary,
    QueryClient,
    dehydrate,
} from '@tanstack/react-query';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getTracks } from './actions';
import { StudioSidebar } from './studio-sidebar';

export const metadata: Metadata = {
    title: 'Studio',
};

interface StudioLayoutProps {
    children: React.ReactNode;
}

const StudioLayout = async ({ children }: StudioLayoutProps) => {
    const { user } = await getUserSession();
    if (!user) {
        return redirect('/auth/sign-in');
    }
    if (!user.emailVerified) {
        return redirect('/auth/email-verification');
    }

    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({
        queryKey: ['polling-tracks'],
        queryFn: async () => {
            const { data } = await getTracks({});
            return data;
        },
        initialData: await trackModel.findManyByUserId(user.id),
    });

    return (
        <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel
                defaultSize={20}
                minSize={20}
                maxSize={50}
                className="hidden md:block"
            >
                <aside>
                    <ScrollArea className="h-full">
                        <StudioSidebar items={studioConfig.sidebarNav} />
                    </ScrollArea>
                </aside>
            </ResizablePanel>
            <ResizableHandle className="hidden opacity-30 hover:opacity-100 md:flex" />
            <ResizablePanel defaultSize={80}>
                <HydrationBoundary state={dehydrate(queryClient)}>
                    {children}
                </HydrationBoundary>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};

export default StudioLayout;
