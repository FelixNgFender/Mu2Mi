import { FeatureHeader } from '../feature-header';
import { TrackTable } from '../track-table';

const LyricsPage = async () => {
    return (
        <>
            <FeatureHeader
                title="Track Analysis"
                href="analysis/new"
                ctaLabel="Upload Track"
            />
            <TrackTable filter="trackAnalysisStatus" />
        </>
    );
};

export default LyricsPage;
