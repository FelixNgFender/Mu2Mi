'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { LyricsTranscriptionWebhookBody } from '@/types/replicate';
import {
    FastForward,
    Pause,
    Play,
    Rewind,
    SkipBack,
    SkipForward,
    Volume,
    Volume2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type KaraokePageProps = {
    audioSrc?: string;
    lyrics: LyricsTranscriptionWebhookBody['output']['chunks'];
};

export const KaraokePlayer = ({
    audioSrc,
    lyrics: fetchedLyrics,
}: KaraokePageProps) => {
    const lyricsContainerRef = useRef<HTMLDivElement>(null);
    const [scrollAreaHeight, setScrollAreaHeight] = useState(0);
    const [currentLine, setCurrentLine] = useState(0);
    const [timeProgress, setTimeProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(100);

    const playAnimationRef = useRef<number | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressBarValueRef = useRef<number>(0);
    const lyrics = useRef<LyricsTranscriptionWebhookBody['output']['chunks']>(
        [],
    );

    const onLoadedMetadata = () => {
        if (!audioRef.current) {
            return;
        }
        const seconds = audioRef.current.duration;
        setDuration(seconds);
    };

    const repeat = useCallback(() => {
        if (!audioRef.current) {
            return;
        }
        const currentTime = audioRef.current.currentTime;
        let line = -1;
        for (let i = 0; i < lyrics.current.length; i++) {
            if (currentTime >= lyrics.current[i]!.timestamp[0]!) {
                line = i;
            }
        }

        if (line !== -1) {
            setCurrentLine(line);
        }
        progressBarValueRef.current = currentTime;
        setTimeProgress(currentTime);
        playAnimationRef.current = requestAnimationFrame(repeat);
    }, [audioRef, setTimeProgress, progressBarValueRef]);

    useEffect(() => {
        if (fetchedLyrics) {
            lyrics.current = fetchedLyrics;
        }
    }, [fetchedLyrics]);

    useEffect(() => {
        if (isPlaying) {
            audioRef.current?.play();
        } else {
            audioRef.current?.pause();
        }
        playAnimationRef.current = requestAnimationFrame(repeat);
    }, [isPlaying, audioRef, repeat]);

    useEffect(() => {
        if (audioRef && audioRef.current) {
            audioRef.current.volume = volume / 100;
        }
    }, [volume, audioRef]);

    useEffect(() => {
        if (lyricsContainerRef.current) {
            setScrollAreaHeight(lyricsContainerRef.current.clientHeight);
        }
    }, [lyricsContainerRef.current?.clientHeight]);

    const handleSkipBack = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }
    };

    const handleRewind = () => {
        if (!audioRef.current) {
            return;
        }
        audioRef.current.currentTime -= 5;
    };

    const togglePlayPause = () => {
        setIsPlaying((prev) => !prev);
    };

    const handleFastForward = () => {
        if (!audioRef.current) {
            return;
        }
        audioRef.current.currentTime += 5;
    };

    const handleSkipForward = () => {
        if (!audioRef.current) {
            return;
        }
        audioRef.current.currentTime = audioRef.current.duration;
    };

    const formatTime = (time: number) => {
        if (time && !isNaN(time)) {
            const minutes = Math.floor(time / 60);
            const formatMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
            const seconds = Math.floor(time % 60);
            const formatSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
            return `${formatMinutes}:${formatSeconds}`;
        }
        return '00:00';
    };

    return (
        <div className="flex h-full flex-col space-y-4">
            <audio
                src={audioSrc}
                ref={audioRef}
                onLoadedMetadata={onLoadedMetadata}
                onEnded={() => {
                    setIsPlaying(false);
                }}
                className="hidden"
            >
                Your browser does not support the
                <code>audio</code> element.
            </audio>
            <div className="flex-1" ref={lyricsContainerRef}>
                <ScrollArea
                    className="mx-auto max-w-[512px] space-y-2"
                    style={{ height: scrollAreaHeight }}
                >
                    {lyrics.current.map((line, index) => (
                        <Button
                            key={index}
                            variant={
                                index === currentLine ? 'default' : 'ghost'
                            }
                            size="lg"
                            className="w-full justify-start whitespace-normal rounded-none px-4 py-2 text-left font-semibold transition-colors duration-200"
                            onClick={() => {
                                if (audioRef.current) {
                                    audioRef.current.currentTime =
                                        line.timestamp[0]!;
                                }
                            }}
                        >
                            {line.text}
                        </Button>
                    ))}
                </ScrollArea>
            </div>
            <div className="flex flex-col items-center space-y-2">
                <div className="flex w-full items-center justify-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                        {formatTime(timeProgress)}
                    </span>
                    <Slider
                        className="h-2 max-w-md"
                        min={0}
                        max={duration}
                        value={[progressBarValueRef.current]}
                        onValueChange={(e) => {
                            if (!e[0]) {
                                return;
                            }
                            if (audioRef.current) {
                                progressBarValueRef.current = e[0];
                                audioRef.current.currentTime =
                                    progressBarValueRef.current;
                            }
                        }}
                        includesThumb={false}
                    />
                    <span className="text-xs text-muted-foreground">
                        {formatTime(duration)}
                    </span>
                </div>
                <div className="flex space-x-1">
                    <Button
                        type="button"
                        title="Skip back"
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={handleSkipBack}
                    >
                        <SkipBack className="h-4 w-4" />
                        <span className="sr-only">Skip back</span>
                    </Button>
                    <Button
                        type="button"
                        title="Rewind"
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={handleRewind}
                    >
                        <Rewind className="h-4 w-4" />
                        <span className="sr-only">Rewind</span>
                    </Button>
                    <Button
                        type="button"
                        title={isPlaying ? 'Pause' : 'Play'}
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={togglePlayPause}
                    >
                        {isPlaying ? (
                            <Pause className="h-6 w-6" />
                        ) : (
                            <Play className="h-6 w-6" />
                        )}
                        <span className="sr-only">
                            {isPlaying ? 'Pause' : 'Play'}
                        </span>
                    </Button>
                    <Button
                        type="button"
                        title="Fast forward"
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={handleFastForward}
                    >
                        <FastForward className="h-4 w-4" />
                        <span className="sr-only">Fast forward</span>
                    </Button>
                    <Button
                        type="button"
                        title="Skip forward"
                        variant="ghost"
                        size="icon"
                        className="rounded-full"
                        onClick={handleSkipForward}
                    >
                        <SkipForward className="h-4 w-4" />
                        <span className="sr-only">Skip forward</span>
                    </Button>
                </div>
                <div className="w-64 space-y-2">
                    <div className="flex space-x-2">
                        <Volume className="h-6 w-6" />
                        <Slider
                            id="volumeInput"
                            min={0}
                            max={100}
                            step={1}
                            value={[volume]}
                            onValueChange={(e) => {
                                if (!e[0]) {
                                    return;
                                }
                                setVolume(e[0]);
                            }}
                        />
                        <Volume2 className="h-6 w-6" />
                    </div>
                </div>
            </div>
        </div>
    );
};
