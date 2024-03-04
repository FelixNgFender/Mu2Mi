import { siteConfig } from '@/config/site';
import { getUserSession } from '@/models/user';
import { redirect } from 'next/navigation';

import { FeatureHeader } from '../feature-header';
import { TrackTable } from '../track-table';

const GenerationPage = async () => {
    const { user } = await getUserSession();

    if (!user) {
        return redirect(siteConfig.paths.auth.signIn);
    }

    if (!user.emailVerified) {
        return redirect(siteConfig.paths.auth.emailVerification);
    }

    return (
        <>
            <FeatureHeader
                title="Music Generation"
                href={siteConfig.paths.studio.newMusicGeneration}
                ctaLabel="Create Track"
            />
            <TrackTable filter="musicGenerationStatus" />
        </>
    );
};

export default GenerationPage;
