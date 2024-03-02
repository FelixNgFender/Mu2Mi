import { getUserSession } from '@/models/user';
import { redirect } from 'next/navigation';

import { FeatureHeader } from '../feature-header';
import { TrackTable } from '../track-table';

const GenerationPage = async () => {
    const { user } = await getUserSession();

    if (!user) {
        return redirect('/auth/sign-in');
    }

    if (!user.emailVerified) {
        return redirect('/auth/email-verification');
    }

    return (
        <>
            <FeatureHeader
                title="Music Generation"
                href="studio/new"
                ctaLabel="Create Track"
            />
            <TrackTable filter="musicGenerationStatus" />
        </>
    );
};

export default GenerationPage;
