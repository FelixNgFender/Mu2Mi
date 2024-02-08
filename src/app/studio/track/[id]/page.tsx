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
        queryKey: ['track-assets-links'],
        queryFn: async () => {
            const result = await downloadTrack(params.id);
            if (result && !result.success) {
                throw new Error(result.error);
            }
            return result.data as Asset[];
        },
    });

    const assets = useQueries({
        queries: assetLinks
            ? assetLinks.map((asset) => {
                  return {
                      queryKey: ['track-assets', asset.id],
                      queryFn: async () => {
                          const response = await fetch(asset.url);
                          if (!response.ok) {
                              throw new Error(
                                  `Failed to download asset: ${asset.url} - ${response.status} ${response.statusText}`,
                              );
                          }
                          return {
                              src: asset.url,
                              name: asset.type || 'track' + Date.now(),
                          };
                      },
                  };
              })
            : [],
    });

    useEffect(() => {
        if (assets.some((a) => a.isError) && assets.some((a) => !a.isPending)) {
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
            console.log(assets.map((a) => a.data?.src));
            await playlist.load(assets.map((a) => a.data?.src));
        };

        loadPlaylist();
    }, [assets]);

    if (isPending || assets.some((a) => a.isPending)) {
        return <div>Loading...</div>;
    }

    if (isError || assets.some((a) => a.isError)) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {error?.message ||
                        assets.find((a) => a.isError)?.error?.message}
                </AlertDescription>
            </Alert>
        );
    }

    return <div id="playlist" className="h-full w-full" />;
};

export default TrackPage;
