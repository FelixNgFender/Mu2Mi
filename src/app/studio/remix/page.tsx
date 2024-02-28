import { FeatureHeader } from '../feature-header';
import { TrackTable } from '../track-table';

const RemixPage = async () => {
    return (
        <>
            <FeatureHeader
                title="Style Remix"
                href="remix/new"
                ctaLabel="Upload Track"
            />
            <TrackTable filter="styleRemixStatus" />
        </>
    );
};

export default RemixPage;
