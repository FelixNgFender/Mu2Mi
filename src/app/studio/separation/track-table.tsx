'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DataTable } from '@/components/ui/data-table';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';

import { getTracks } from '../actions';
import { trackTableColumns } from './track-table-columns';

export const TrackTable = () => {
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

    return (
        <DataTable
            columns={trackTableColumns}
            data={tracks.filter((track) => track.trackSeparationStatus)}
        />
    );
};