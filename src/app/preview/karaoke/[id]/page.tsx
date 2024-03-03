import { KaraokePlayer } from '@/app/karaoke-player';
import { downloadPublicTrackAssets } from '@/app/studio/queries';
import { formatValidationErrors } from '@/lib/utils';
import { LyricsTranscriptionWebhookBody } from '@/types/replicate';

type KaraokePageProps = {
    params: {
        id: string;
    };
};

const KaraokePage = async ({ params }: KaraokePageProps) => {
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

    const audioSrc = assetLinks?.filter((link) => link.type === 'original')[0]
        ?.url;
    const lyricsSrc = assetLinks?.filter((link) => link.type === 'lyrics')[0]
        ?.url;

    if (!lyricsSrc) {
        throw new Error('No lyrics found');
    }
    const res = await fetch(lyricsSrc);
    if (!res.ok) {
        throw new Error('Failed to fetch lyrics');
    }
    const lyrics = (await res.json())
        .chunks as LyricsTranscriptionWebhookBody['output']['chunks'];

    return (
        <div className="flex-1 pb-8 sm:pb-16">
            <KaraokePlayer audioSrc={audioSrc} lyrics={lyrics} />
        </div>
    );
};

export default KaraokePage;
