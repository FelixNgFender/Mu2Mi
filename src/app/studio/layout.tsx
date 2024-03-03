import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { studioConfig } from '@/config/studio';
import { getUserSession } from '@/models/user';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

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
            <ResizablePanel defaultSize={80}>{children}</ResizablePanel>
        </ResizablePanelGroup>
    );
};

export default StudioLayout;
