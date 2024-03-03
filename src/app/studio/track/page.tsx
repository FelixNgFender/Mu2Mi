import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

const AudioPlayer = dynamic(() => import('@/app/audio-player'), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col space-y-4">
            <div className="my-1 flex justify-between space-x-2">
                <div />
                <Skeleton className="h-10 w-72" />
                <Skeleton className="h-10 w-40" />
            </div>
            <div className="flex-1">
                <Skeleton className="mt-4 h-96 w-full" />
            </div>
        </div>
    ),
});

const AudioPreviewPage = async () => {
    return <AudioPlayer assetLinks={[]} />;
};

export default AudioPreviewPage;
