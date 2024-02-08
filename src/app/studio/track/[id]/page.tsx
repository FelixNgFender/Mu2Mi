'use client';

import { downloadTrack } from '@/app/studio/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Asset } from '@/types/asset';
import { useQueries, useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import WaveformPlaylist from 'waveform-playlist';

type TrackPageProps = {
    params: {
        id: string;
    };
};

const TrackPage = ({ params }: TrackPageProps) => {
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

    useEffect(() => {
        if (!assetLinks) {
            return;
        }

        const loadPlaylist = async () => {
            const playlist = WaveformPlaylist({
                samplesPerPixel: 3000,
                mono: true,
                waveHeight: 70,
                container: document.getElementById('playlist'),
                state: 'cursor',
                colors: {
                    waveOutlineColor: '#E0EFF1',
                    timeColor: 'grey',
                    fadeColor: 'black',
                },
                controls: {
                    show: false,
                    width: 150,
                },
                zoomLevels: [500, 1000, 3000, 5000],
            });
            console.log(
                assetLinks.map((asset) => {
                    return {
                        src: asset.url,
                        name: asset.type || 'track' + Date.now(),
                    };
                }),
            );
            await playlist.load(
                assetLinks.map((asset) => {
                    return {
                        src: asset.url,
                        name: asset.type || 'track' + Date.now(),
                    };
                }),
            );
        };

        loadPlaylist();
    }, [assetLinks]);

    if (isPending) {
        return <div>Loading...</div>;
    }

    if (isError) {
        return (
            <section className="container relative flex h-full max-w-screen-lg flex-col space-y-4 py-4">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                </Alert>
            </section>
        );
    }

    return <div id="playlist" className="h-full w-full" />;
};

export default TrackPage;
