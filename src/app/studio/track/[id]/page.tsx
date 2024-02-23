'use client';

import { downloadTrack } from '@/app/studio/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

const AudioPlayer = dynamic(() => import('../audio-player'), {
    ssr: false,
    // TODO: replace this
    loading: () => <p>Loading...</p>,
});

const imageLoader = ({
    src,
    width,
    quality,
}: {
    src: string;
    width: number;
    quality?: number;
}) => {
    return `${src}`;
};

type TrackPageProps = {
    params: {
        id: string;
    };
};

const TrackPage = ({ params }: TrackPageProps) => {
    const searchParams = useSearchParams();
    const callback = searchParams.get('callback');
    const {
        isPending,
        isError,
        data: assetLinks,
        error,
    } = useQuery({
        queryKey: ['track-assets', params.id],
        queryFn: async () => {
            const { data } = await downloadTrack({ trackId: params.id });
            return data;
        },
    });

    if (isPending) {
        return null;
    }

    if (isError) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
            </Alert>
        );
    }

    return (
        <>
            <AudioPlayer
                assetLinks={assetLinks?.filter(
                    (link) =>
                        link.type !== 'analysis_viz' &&
                        link.type !== 'analysis',
                )}
                callback={callback ? callback : undefined}
            />
            {assetLinks?.find((link) => link.type === 'analysis_viz') && (
                <ScrollArea className="w-full whitespace-nowrap rounded-md border px-4 py-2 sm:border-0">
                    <div className="relative mx-auto min-h-96 w-[1024px]">
                        <Image
                            loader={imageLoader}
                            src={
                                assetLinks?.find(
                                    (link) => link.type === 'analysis_viz',
                                )?.url!
                            }
                            alt="Track analysis visualization"
                            fill
                            priority
                            unoptimized
                            className="object-contain"
                        />
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            )}
        </>
    );
};

export default TrackPage;
