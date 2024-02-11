'use client';

import { downloadTrack } from '@/app/studio/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Asset } from '@/types/asset';
import { useQuery } from '@tanstack/react-query';
import EventEmitter from 'events';
import {
    AlertTriangle,
    ChevronLeftCircle,
    Download,
    FastForward,
    Pause,
    Play,
    Rewind,
    Square,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useState } from 'react';
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

    const [ee] = useState(new EventEmitter());

    const playlist = useCallback(
        (node: HTMLDivElement | null) => {
            // @ts-expect-error - WaveformPlaylist is not typed
            let playlistInstance;
            if (node !== null && assetLinks) {
                playlistInstance = WaveformPlaylist(
                    {
                        container: node,
                        samplesPerPixel: 2048,
                        mono: true,
                        exclSolo: true,
                        timescale: true,
                        controls: {
                            show: true,
                            width: 200,
                        },
                        colors: {
                            waveOutlineColor: 'black',
                        },
                        waveHeight: 128,
                        barWidth: 1,
                        barGap: 0,
                        state: 'cursor',
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

                playlistInstance.load(
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
                playlistInstance.initExporter();
            }

            return () => {
                // @ts-expect-error - WaveformPlaylist is not typed
                if (playlistInstance) {
                    // Stops playout if playlist is playing, removes all tracks from the playlist
                    ee.emit('clear');
                }
            };
        },
        [assetLinks, ee],
    );

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
        <>
            <div className="flex justify-between space-x-2" role="group">
                <Link
                    href="/studio"
                    className={cn(
                        buttonVariants({ variant: 'link' }),
                        'self-start',
                    )}
                >
                    <span>
                        <ChevronLeftCircle className="mr-2 h-4 w-4" />
                    </span>
                    <span>Back to tracks</span>
                </Link>
                <div className="flex space-x-1">
                    <Button
                        type="button"
                        title="Play"
                        variant="secondary"
                        size="icon"
                        onClick={() => {
                            ee.emit('play');
                        }}
                    >
                        <Play className="h-4 w-4" />
                        <span className="sr-only">Play</span>
                    </Button>
                    <Button
                        type="button"
                        title="Pause"
                        variant="secondary"
                        size="icon"
                        onClick={() => {
                            ee.emit('pause');
                        }}
                    >
                        <Pause className="h-4 w-4" />
                        <span className="sr-only">Pause</span>
                    </Button>
                    <Button
                        type="button"
                        title="Stop"
                        variant="secondary"
                        size="icon"
                        onClick={() => {
                            ee.emit('stop');
                        }}
                    >
                        <Square className="h-4 w-4" />
                        <span className="sr-only">Stop</span>
                    </Button>
                    <Button
                        type="button"
                        title="Rewind"
                        variant="secondary"
                        size="icon"
                        onClick={() => {
                            ee.emit('rewind');
                        }}
                    >
                        <Rewind className="h-4 w-4" />
                        <span className="sr-only">Rewind</span>
                    </Button>
                    <Button
                        type="button"
                        title="Fast forward"
                        variant="secondary"
                        size="icon"
                        onClick={() => ee.emit('fastforward')}
                    >
                        <FastForward className="h-4 w-4" />
                        <span className="sr-only">Fast forward</span>
                    </Button>
                    <Button
                        type="button"
                        title="Zoom in"
                        variant="secondary"
                        size="icon"
                        onClick={() => ee.emit('zoomin')}
                    >
                        <ZoomIn className="h-4 w-4" />
                        <span className="sr-only">Zoom in</span>
                    </Button>
                    <Button
                        type="button"
                        title="Zoom out"
                        variant="secondary"
                        size="icon"
                        onClick={() => {
                            ee.emit('zoomout');
                        }}
                    >
                        <ZoomOut className="h-4 w-4" />
                        <span className="sr-only">Zoom out</span>
                    </Button>
                </div>
                <Button
                    type="button"
                    title="Download audio"
                    onClick={() => {
                        ee.emit('startaudiorendering', 'wav');
                    }}
                >
                    <Download className=" mr-2 h-4 w-4" />
                    Download audio
                </Button>
            </div>
            <div className="flex-1" ref={playlist} />
        </>
    );
};

export default TrackPage;
