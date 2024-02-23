import { FeatureHeader } from '../feature-header';
import { TrackTable } from '../track-table';

const AnalysisPage = async () => {
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

export default AnalysisPage;
