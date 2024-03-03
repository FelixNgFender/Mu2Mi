import { downloadPublicTrackAssets } from '@/app/studio/queries';
import { formatValidationErrors } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

const MidiPlayer = dynamic(() => import('@/app/midi-player'), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full flex-col items-center justify-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm text-muted-foreground">
                Loading preview...
            </span>
        </div>
    ),
});

type MidiTrackPageProps = {
    params: {
        id: string;
    };
};

const MidiTrackPage = async ({ params }: MidiTrackPageProps) => {
    const trackId = params.id;

    const {
        data: assetLinks,
        validationErrors,
        serverError,
    } = await downloadPublicTrackAssets({
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
            isPublic
        />
    );
};

export default MidiTrackPage;
