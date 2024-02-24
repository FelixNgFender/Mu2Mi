'use client';

import { downloadTrack } from '@/app/studio/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

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
    const searchParams = useSearchParams();
    const callback = searchParams.get('callback');
    const {
        isPending,
        isError,
        data: assetLinks,
        error,
    } = useQuery({
        queryKey: ['track-assets', params.id],
        queryFn: async () => {
            const { data, serverError } = await downloadTrack({
                trackId: params.id,
            });
            if (serverError || !data) {
                throw new Error(serverError);
            }
            return data;
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
            callback={callback ? callback : undefined}
        />
    );
};

export default MidiTrackPage;
