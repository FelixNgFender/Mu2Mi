'use client';

import { downloadTrack } from '@/app/studio/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LyricsTranscriptionWebhookBody } from '@/types/replicate';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ChevronLeftCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import { KaraokePlayer } from '../karaoke-player';

type KaraokePageProps = {
    params: {
        id: string;
    };
};

const KaraokePage = ({ params }: KaraokePageProps) => {
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

    const audioSrc = assetLinks?.filter((link) => link.type === 'original')[0]
        ?.url;
    const lyricsSrc = assetLinks?.filter((link) => link.type === 'lyrics')[0]
        ?.url;

    const {
        data: lyrics,
        isPending: lyricsIsPending,
        isError: lyricsIsError,
        error: lyricsError,
    } = useQuery({
        queryKey: ['track-lyrics', lyricsSrc],
        queryFn: async () => {
            if (!lyricsSrc) {
                throw new Error('No lyrics found');
            }
            const res = await fetch(lyricsSrc);
            if (!res.ok) {
                throw new Error('Failed to fetch lyrics');
            }
            return (await res.json())
                .chunks as LyricsTranscriptionWebhookBody['output']['chunks'];
        },
        enabled: !!lyricsSrc,
    });

    if (isPending || lyricsIsPending) {
        return null;
    }

    if (isError || lyricsIsError) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {error?.message}
                    <br />
                    {lyricsError?.message}
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <>
            {callback && (
                <Link
                    href={callback}
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
            )}
            <div className="flex-1 pb-8 sm:pb-16">
                <KaraokePlayer audioSrc={audioSrc} lyrics={lyrics} />
            </div>
        </>
    );
};

export default KaraokePage;
