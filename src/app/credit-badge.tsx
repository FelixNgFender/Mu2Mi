import { Badge } from '@/components/ui/badge';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card';
import { siteConfig } from '@/config/site';
import { getUserSession } from '@/models/user';
import Link from 'next/link';

import { getUserCredits } from './queries';

function formatTime(ms: number): string {
    const hours = Math.floor(ms / 1000 / 60 / 60);
    const minutes = Math.floor(ms / 1000 / 60) % 60;

    if (hours >= 1) {
        return `${hours < 10 ? hours : hours.toString().padStart(2, '0')} hour${
            hours > 1 ? 's' : ''
        }`;
    } else {
        return `${
            minutes < 10 ? minutes : minutes.toString().padStart(2, '0')
        } minute${minutes > 1 ? 's' : ''}`;
    }
}

export const CreditBadge = async () => {
    const { user } = await getUserSession();

    if (!user || !user.emailVerified) {
        return null;
    }

    const { data: credits, serverError } = await getUserCredits({});

    if (serverError || !credits) {
        throw new Error(serverError);
    }

    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                <Badge variant="secondary" className="whitespace-nowrap">
                    <Link href={siteConfig.paths.pricing}>
                        Credit: {credits.remainingCredits}
                    </Link>
                </Badge>
            </HoverCardTrigger>
            <HoverCardContent className="w-40 p-2 text-center text-sm font-semibold">
                {credits.msBeforeNext > 0
                    ? `Reset in ${formatTime(credits.msBeforeNext)}`
                    : 'Starting fresh!'}
            </HoverCardContent>
        </HoverCard>
    );
};
