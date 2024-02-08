'use client';

import { downloadTrack } from '@/app/studio/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast, useToast } from '@/components/ui/use-toast';
import { Asset } from '@/types/asset';
import { useQuery } from '@tanstack/react-query';
import EventEmitter from 'events';
import {
    AlertTriangle,
    Download,
    FastForward,
    Pause,
    Play,
    Rewind,
    Square,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
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
    const { toast } = useToast();

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

            // await playlist.load(
            //     assetLinks.map((asset) => {
            //         return {
            //             src: asset.url,
            //             name:
            //                 (asset.type &&
            //                     asset.type.charAt(0).toUpperCase() +
            //                         asset.type.slice(1)) ||
            //                 'track' + Date.now(),
            //         };
            //     }),
            // );

            // await playlist.initExporter();
        };
        try {
            loadPlaylist();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: (error as Error).message || '',
            });
        }
    }, [assetLinks, ee, toast]);

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
    // TODO: investigate why rendering twice when navigating around with Links
    return (
        <>
            <div className="mx-auto flex space-x-4" role="group">
                <div className='flex space-x-1'>
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
                    </Button>
                    <Button
                        type="button"
                        title="Fast forward"
                        variant="secondary"
                        size="icon"
                        onClick={() => ee.emit('fastforward')}
                    >
                        <FastForward className="h-4 w-4" />
                    </Button>
                </div>
                <div className='flex space-x-1'>
                    <Button
                        type="button"
                        title="Zoom in"
                        variant="secondary"
                        size="icon"
                        onClick={() => ee.emit('zoomin')}
                    >
                        <ZoomIn className="h-4 w-4" />
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
                    </Button>
                </div>
                <Button
                    type="button"
                    title="Download rendered audio"
                    variant="secondary"
                    size="icon"
                    onClick={() => {
                        ee.emit('startaudiorendering', 'wav');
                    }}
                >
                    <Download className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex-1" ref={playlistRef} />
        </>
    );
};

export default TrackPage;
