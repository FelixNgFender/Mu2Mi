import { downloadUserTrackAssets } from '@/app/studio/queries';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { siteConfig } from '@/config/site';
import { httpStatus } from '@/lib/http';
import { formatValidationErrors } from '@/lib/utils';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const AudioPlayer = dynamic(() => import('@/app/audio-player'), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col space-y-4">
            <div className="my-1 flex justify-between space-x-2">
                <Skeleton className="h-full w-32 max-w-full" />
                <Skeleton className="h-10 w-72" />
                <Skeleton className="h-10 w-40" />
            </div>
            <div className="flex-1">
                <Skeleton className="mt-12 h-[480px] w-full" />
            </div>
        </div>
    ),
});

type TrackPageProps = {
    params: {
        id: string;
    };
    searchParams: { callback?: string };
};

const validCallbacks = [
    siteConfig.paths.studio.musicGeneration,
    // siteConfig.paths.studio.styleRemix,
    siteConfig.paths.studio.trackSeparation,
    siteConfig.paths.studio.trackAnalysis,
];

const TrackPage = async ({ params, searchParams }: TrackPageProps) => {
    const trackId = params.id;
    const callback = searchParams.callback;

    if (callback && !(validCallbacks as string[]).includes(callback)) {
        throw new Error(httpStatus.clientError.badRequest.humanMessage);
    }

    const {
        data: assetLinks,
        validationErrors,
        serverError,
    } = await downloadUserTrackAssets({
        trackId,
    });

    if (validationErrors) {
        throw new Error(formatValidationErrors(validationErrors));
    }

    if (serverError || !assetLinks) {
        throw new Error(serverError);
    }

    return (
        <>
            <AudioPlayer
                assetLinks={assetLinks.filter(
                    (link) =>
                        link.type !== 'analysis_viz' &&
                        link.type !== 'analysis',
                )}
                callback={callback ? callback : undefined}
            />
            {assetLinks.find((link) => link.type === 'analysis_viz') && (
                <ScrollArea className="w-full whitespace-nowrap rounded-md border px-4 py-2 sm:border-0">
                    <div className="relative mx-auto min-h-96 w-[1024px]">
                        <Image
                            src={
                                assetLinks.find(
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
