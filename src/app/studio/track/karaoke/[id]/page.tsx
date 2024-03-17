import { KaraokePlayer } from '@/app/karaoke-player';
import { downloadUserTrackAssets } from '@/app/studio/queries';
import { buttonVariants } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { httpStatus } from '@/lib/http';
import { cn, formatValidationErrors } from '@/lib/utils';
import { LyricsTranscriptionWebhookBody } from '@/types/replicate';
import { ChevronLeftCircle } from 'lucide-react';
import Link from 'next/link';

type KaraokePageProps = {
    params: {
        id: string;
    };
    searchParams: { callback?: string };
};

const validCallbacks = [siteConfig.paths.studio.lyricsTranscription];

const KaraokePage = async ({ params, searchParams }: KaraokePageProps) => {
    const trackId = params.id;
    const callback = searchParams.callback;

    if (callback && !(validCallbacks as string[]).includes(callback)) {
        throw new Error(httpStatus.clientError.badRequest.humanMessage);
    }

    const {
        data: assetLinks,
        validationErrors,
        serverError,
    } = await downloadUserTrackAssets({
        trackId,
    });

    if (validationErrors) {
        throw new Error(formatValidationErrors(validationErrors));
    }

    if (serverError || !assetLinks) {
        throw new Error(serverError);
    }

    const audioSrc = assetLinks?.filter((link) => link.type === 'original')[0]
        ?.url;
    const lyricsSrc = assetLinks?.filter((link) => link.type === 'lyrics')[0]
        ?.url;

    if (!lyricsSrc) {
        throw new Error('No lyrics found');
    }
    const res = await fetch(lyricsSrc);
    if (!res.ok) {
        throw new Error('Failed to fetch lyrics');
    }
    const lyrics = (await res.json())
        .chunks as LyricsTranscriptionWebhookBody['output']['chunks'];

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
