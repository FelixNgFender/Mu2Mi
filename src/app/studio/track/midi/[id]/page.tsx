'use client';

import { downloadTrack } from '@/app/studio/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Asset } from '@/types/asset';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';

const MidiPlayer = dynamic(() => import('../midi-player'), {
    ssr: false,
    // TODO: replace this
    loading: () => <p>Loading...</p>,
});

type MidiTrackPageProps = {
    params: {
        id: string;
    };
};

const MidiTrackPage = ({ params }: MidiTrackPageProps) => {
    const {
        isPending,
        isError,
        data: assetLinks,
        error,
    } = useQuery({
        queryKey: ['track-assets', params.id],
        queryFn: async () => {
            const result = await downloadTrack(params.id);
            if (result && !result.success) {
                throw new Error(result.error);
            }
            return result.data as Asset[];
        },
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
        <MidiPlayer
            initialURL={assetLinks.find((a) => a.type === 'midi')?.url}
        />
    );
};

export default MidiTrackPage;
