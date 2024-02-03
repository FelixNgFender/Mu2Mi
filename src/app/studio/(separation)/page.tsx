import { getUserSession } from '@/lib/auth';
import { Track, trackModel } from '@/models/track';
import {
    HydrationBoundary,
    QueryClient,
    dehydrate,
} from '@tanstack/react-query';

import { getTracks } from './actions';
import { SeparationHeader } from './separation-header';
import { TrackTable } from './track-table';

const SeparationPage = async () => {
    const { user } = await getUserSession();
    if (!user) {
        return null;
    }

    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({
        queryKey: ['polling-tracks'],
        queryFn: async () => {
            const result = await getTracks();
            if (result && !result.success) {
                throw new Error(result.error);
            }
            return result.data;
        },
        initialData: await trackModel.findManyByUserId(user.id),
    });

    return (
        <>
            <SeparationHeader />
            <HydrationBoundary state={dehydrate(queryClient)}>
                <TrackTable />
            </HydrationBoundary>
        </>
    );
};

export default SeparationPage;
