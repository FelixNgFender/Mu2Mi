import { StudioSidebar } from '@/components/studio-sidebar';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable';

interface StudioLayoutProps {
    children: React.ReactNode;
}

const StudioLayout = async ({ children }: StudioLayoutProps) => {
    return (
        <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel
                defaultSize={20}
                minSize={20}
                maxSize={50}
                className="hidden md:block"
            >
                <StudioSidebar />
            </ResizablePanel>
            <ResizableHandle className="hidden opacity-30 hover:opacity-100 md:flex" />
            <ResizablePanel defaultSize={80}>{children}</ResizablePanel>
        </ResizablePanelGroup>
    );
};

export default StudioLayout;
