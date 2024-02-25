'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DataTable } from '@/components/ui/data-table';
import { TrackStatusColumn } from '@/config/studio';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { getTracks } from './actions';
import { trackTableColumnsBuiler } from './track-table-columns';

type TrackTableProps = {
    filter: TrackStatusColumn;
};

export const TrackTable = ({ filter }: TrackTableProps) => {
    const pathname = usePathname();
    const {
        isPending,
        isError,
        data: tracks,
        error,
    } = useQuery({
        queryKey: ['polling-tracks'],
        queryFn: async () => {
            const { data, serverError } = await getTracks({});
            if (serverError || !data) {
                throw new Error(serverError);
            }
            return data;
        },
        refetchInterval: 3000,
    });

    if (isPending) {
        return null;
    }

    if (isError) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error.message}</AlertDescription>
            </Alert>
        );
    }

    const previewPath = pathname.includes('separation')
        ? '/studio/track'
        : pathname.includes('analysis')
          ? '/studio/track'
          : pathname.includes('midi')
            ? '/studio/track/midi'
            : pathname.includes('lyrics')
              ? '/studio/track/karaoke'
              : undefined;

    const callback = pathname.includes('separation')
        ? '/studio/separation'
        : pathname.includes('analysis')
          ? '/studio/analysis'
          : pathname.includes('midi')
            ? '/studio/midi'
            : pathname.includes('lyrics')
              ? '/studio/lyrics'
              : undefined;

    return (
        <DataTable
            columns={trackTableColumnsBuiler(filter, previewPath, callback)}
            data={tracks.filter((track) => track[filter])}
        />
    );
};
