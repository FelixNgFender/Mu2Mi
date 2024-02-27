import { FeatureHeader } from '../feature-header';
import { TrackTable } from '../track-table';

const GenerationPage = async () => {
    return (
        <>
            <FeatureHeader
                title="Music Generation"
                href="studio/new"
                ctaLabel="Create Track"
            />
            <TrackTable filter="musicgenStatus" />
        </>
    );
};

export default GenerationPage;
