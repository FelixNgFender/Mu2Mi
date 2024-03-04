import { siteConfig } from '@/config/site';

import { FeatureHeader } from '../feature-header';
import { TrackTable } from '../track-table';

const AnalysisPage = async () => {
    return (
        <>
            <FeatureHeader
                title="Track Analysis"
                href={siteConfig.paths.studio.newTrackAnalysis}
                ctaLabel="Upload Track"
            />
            <TrackTable filter="trackAnalysisStatus" />
        </>
    );
};

export default AnalysisPage;
