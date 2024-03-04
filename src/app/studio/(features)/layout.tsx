import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { siteConfig } from '@/config/site';
import { getUserSession } from '@/models/user';
import {
    HydrationBoundary,
    QueryClient,
    dehydrate,
} from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { getUserTracks } from '../queries';

type TrackTablePrefetchProps = {
    children: React.ReactNode;
};

const TrackTablePrefetch = async ({ children }: TrackTablePrefetchProps) => {
    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({
        queryKey: ['polling-tracks'],
        queryFn: async () => {
            const { data } = await getUserTracks({});
            return data;
        },
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {children}
        </HydrationBoundary>
    );
};

const TrackTableSkeleton = () => {
    return (
        <section className="container relative flex h-full max-w-screen-lg flex-col space-y-4 py-4">
            <div className="flex w-full items-end justify-between space-x-2">
                <Skeleton className="h-full w-64 max-w-full" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div>
                <div className="flex items-center py-4">
                    <Skeleton className="h-10 w-full max-w-sm" />
                </div>
                <div className="rounded-md border">
                    <div className="relative w-full overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[450px]">
                                        Track Name
                                    </TableHead>
                                    <TableHead className="w-48">
                                        Status
                                    </TableHead>
                                    <TableHead className="min-w-48" />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow className="h-16">
                                    <TableCell>
                                        <Skeleton className="h-8 w-48" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-8 w-32" />
                                    </TableCell>
                                </TableRow>
                                <TableRow className="h-16">
                                    <TableCell>
                                        <Skeleton className="h-8 w-48" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-8 w-32" />
                                    </TableCell>
                                </TableRow>
                                <TableRow className="h-16">
                                    <TableCell>
                                        <Skeleton className="h-8 w-48" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-8 w-32" />
                                    </TableCell>
                                </TableRow>
                                <TableRow className="h-16">
                                    <TableCell>
                                        <Skeleton className="h-8 w-48" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-8 w-32" />
                                    </TableCell>
                                </TableRow>
                                <TableRow className="h-16">
                                    <TableCell>
                                        <Skeleton className="h-8 w-48" />
                                    </TableCell>
                                    <TableCell>
                                        <Skeleton className="h-8 w-32" />
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </section>
    );
};

interface StudioFeaturesLayoutProps {
    children: React.ReactNode;
}

const StudioFeaturesLayout = async ({
    children,
}: StudioFeaturesLayoutProps) => {
    const { user } = await getUserSession();

    if (!user) {
        return redirect(siteConfig.paths.auth.signIn);
    }

    if (!user.emailVerified) {
        return redirect(siteConfig.paths.auth.emailVerification);
    }

    return (
        /* Here we don't add more `loading.tsx` or Suspense down the tree because we have
        already determined if a good connection has been made through the prefetchQuery */
        <Suspense fallback={<TrackTableSkeleton />}>
            <TrackTablePrefetch>{children}</TrackTablePrefetch>
        </Suspense>
    );
};

export default StudioFeaturesLayout;
