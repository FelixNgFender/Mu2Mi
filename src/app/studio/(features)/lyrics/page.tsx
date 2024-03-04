import { siteConfig } from '@/config/site';

import { FeatureHeader } from '../feature-header';
import { TrackTable } from '../track-table';

const LyricsPage = async () => {
    return (
        <>
            <FeatureHeader
                title="Lyrics Transcription"
                href={siteConfig.paths.studio.newLyricsTranscription}
                ctaLabel="Upload Track"
            />
            <TrackTable filter="lyricsTranscriptionStatus" />
        </>
    );
};

export default LyricsPage;
