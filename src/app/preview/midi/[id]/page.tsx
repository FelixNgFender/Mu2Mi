import { downloadPublicTrackAssets } from '@/app/studio/queries';
import { formatValidationErrors } from '@/lib/utils';
import dynamic from 'next/dynamic';

const MidiPlayer = dynamic(() => import('@/app/midi-player'), {
    ssr: false,
    // TODO: replace this
    loading: () => <p>Loading...</p>,
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
