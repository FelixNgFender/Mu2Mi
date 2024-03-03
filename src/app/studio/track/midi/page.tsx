import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

const MidiPlayer = dynamic(() => import('@/app/midi-player'), {
    ssr: false,
    loading: () => (
        <div className="flex h-full flex-col space-y-8 pb-4">
            <div className="my-1 flex justify-between space-x-2">
                <div />
                <Skeleton className="h-10 w-80" />
                <div />
            </div>
            <div className="flex flex-1 flex-col">
                <Skeleton className="w-full flex-1" />
            </div>
        </div>
    ),
});

const MidiPreviewPage = () => {
    return <MidiPlayer />;
};

export default MidiPreviewPage;
