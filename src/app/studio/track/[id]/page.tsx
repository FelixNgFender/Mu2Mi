'use client';

import { downloadTrack } from '@/app/studio/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Asset } from '@/types/asset';
import { useQuery } from '@tanstack/react-query';
import EventEmitter from 'events';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import WaveformPlaylist from 'waveform-playlist';

import './playlist.css';

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

    const playlistRef = useRef<HTMLDivElement>(null);
    const [ee] = useState(new EventEmitter());

    useEffect(() => {
        if (!assetLinks || !playlistRef.current) {
            return;
        }

        const loadPlaylist = async () => {
            const playlist = WaveformPlaylist(
                {
                    container: playlistRef.current,
                    samplesPerPixel: 2048,
                    mono: true,
                    exclSolo: true,
                    timescale: true,
                    controls: {
                        show: true,
                        width: 256,
                    },
                    colors: {
                        waveOutlineColor: 'black',
                    },
                    waveHeight: 128,
                    barWidth: 1,
                    barGap: 0,
                    state: 'cursor', // (cursor | select | fadein | fadeout | shift)
                    zoomLevels: [512, 1024, 2048, 4096],
                    isAutomaticScroll: true,
                },
                ee,
            );

            ee.on('audiorenderingfinished', function (type, data) {
                if (type === 'wav') {
                    const url = URL.createObjectURL(data);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = `mu2mi-mixdown-${Date.now()}.wav`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                }
            });

            await playlist.load(
                assetLinks.map((asset) => {
                    return {
                        src: asset.url,
                        name:
                            (asset.type &&
                                asset.type.charAt(0).toUpperCase() +
                                    asset.type.slice(1)) ||
                            'track' + Date.now(),
                    };
                }),
            );

            await playlist.initExporter();
        };

        loadPlaylist();
    }, [assetLinks, ee]);

    if (isPending) {
        return null;
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
    // TODO: investigate why rendering twice when navigating around with Links
    return (
        <>
            <div className="flex space-x-4">
                <Button
                    onClick={() => {
                        ee.emit('play');
                    }}
                >
                    Play
                </Button>
                <Button
                    onClick={() => {
                        ee.emit('pause');
                    }}
                >
                    Pause
                </Button>
                <Button
                    onClick={() => {
                        ee.emit('stop');
                    }}
                >
                    Stop
                </Button>
                <Button
                    onClick={() => {
                        ee.emit('rewind');
                    }}
                >
                    Rewind
                </Button>
                <Button onClick={() => ee.emit('fastforward')}>
                    Fast forward
                </Button>
                <Button onClick={() => ee.emit('zoomin')}>Zoom in</Button>
                <Button
                    onClick={() => {
                        ee.emit('zoomout');
                    }}
                >
                    Zoom out
                </Button>
                <Button
                    onClick={() => {
                        ee.emit('startaudiorendering', 'wav');
                    }}
                >
                    Download
                </Button>
            </div>
            <div className="h-full w-full" ref={playlistRef} />
        </>
    );
};

export default TrackPage;
