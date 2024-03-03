import { downloadUserTrackAssets } from '@/app/studio/queries';
import { Skeleton } from '@/components/ui/skeleton';
import { formatValidationErrors } from '@/lib/utils';
import dynamic from 'next/dynamic';

const MidiPlayer = dynamic(() => import('@/app/midi-player'), {
    ssr: false,
    loading: () => (
        <div className="flex h-full flex-col space-y-8 pb-4">
            <div className="my-1 flex justify-between space-x-2">
                <Skeleton className="h-full w-32 max-w-full" />
                <Skeleton className="h-10 w-80" />
                <div />
            </div>
            <div className="flex flex-1 flex-col">
                <Skeleton className="w-full flex-1" />
            </div>
        </div>
    ),
});

type MidiTrackPageProps = {
    params: {
        id: string;
    };
    searchParams: { callback?: string };
};

const MidiTrackPage = async ({ params, searchParams }: MidiTrackPageProps) => {
    const trackId = params.id;
    const callback = searchParams.callback;

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
        <MidiPlayer
            initialURL={assetLinks.find((a) => a.type === 'midi')?.url}
            callback={callback ? callback : undefined}
        />
    );
};

export default MidiTrackPage;
