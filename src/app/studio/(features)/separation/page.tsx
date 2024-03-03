import { FeatureHeader } from '../feature-header';
import { TrackTable } from '../track-table';

const SeparationPage = async () => {
    return (
        <>
            <FeatureHeader
                title="Track Separation"
                href="separation/new"
                ctaLabel="Upload Track"
            />
            <TrackTable filter="trackSeparationStatus" />
        </>
    );
};

export default SeparationPage;
