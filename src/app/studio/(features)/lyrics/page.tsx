import { FeatureHeader } from '../feature-header';
import { TrackTable } from '../track-table';

const LyricsPage = async () => {
    return (
        <>
            <FeatureHeader
                title="Lyrics Transcription"
                href="lyrics/new"
                ctaLabel="Upload Track"
            />
            <TrackTable filter="lyricsTranscriptionStatus" />
        </>
    );
};

export default LyricsPage;
