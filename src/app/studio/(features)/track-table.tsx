'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { DataTable } from '@/components/ui/data-table';
import { siteConfig } from '@/config/site';
import { TrackStatusColumn } from '@/types/studio';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { pollUserTracks } from '../actions';
import { trackTableColumnsBuiler } from './track-table-columns';

const previewPathMap: Record<string, string> = {
    [siteConfig.paths.studio.musicGeneration]:
        siteConfig.paths.studio.preview.track,
    // [siteConfig.paths.studio.styleRemix]: siteConfig.paths.studio.preview.track,
    [siteConfig.paths.studio.trackSeparation]:
        siteConfig.paths.studio.preview.track,
    [siteConfig.paths.studio.trackAnalysis]:
        siteConfig.paths.studio.preview.track,
    [siteConfig.paths.studio.midiTranscription]:
        siteConfig.paths.studio.preview.midi,
    [siteConfig.paths.studio.lyricsTranscription]:
        siteConfig.paths.studio.preview.karaoke,
};

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
            const { data, serverError } = await pollUserTracks({});
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
            columns={trackTableColumnsBuiler(
                filter,
                previewPathMap[pathname],
                pathname,
            )}
            data={tracks.filter((track) => track[filter])}
        />
    );
};
