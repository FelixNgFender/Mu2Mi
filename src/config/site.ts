export const siteConfig = {
    authors: [
        { name: 'Felix Nguyen', content: 'https://github.com/FelixNgFender' },
    ],
    contact: 'team@mu2mi.com',
    name: 'Mu2Mi',
    title: 'Mu2Mi | The Open Source AI Musical Toolkit',
    url: 'https://mu2mi.com',
    paths: {
        api: {
            webhook: {
                generation: '/api/webhook/generation',
                remix: '/api/webhook/remix',
                separation: '/api/webhook/separation',
                analysis: '/api/webhook/analysis',
                midi: '/api/webhook/midi',
                lyrics: '/api/webhook/lyrics',
            },
            healthcheck: '/api/healthcheck',
            captcha: '/api/captcha',
        },
        home: '/',
        auth: {
            signIn: '/auth/sign-in',
            signUp: '/auth/sign-up',
            passwordReset: '/auth/password-reset',
            emailVerification: '/auth/email-verification',
            googleOAuth: '/auth/sign-in/google',
            // facebookOAuth: '/auth/sign-in/facebook',
            githubOAuth: '/auth/sign-in/github',
        },
        legal: {
            cookie: '/legal/cookie',
            terms: '/legal/terms',
            privacy: '/legal/privacy',
        },
        pricing: '/pricing',
        studio: {
            home: '/studio',
            musicGeneration: '/studio',
            newMusicGeneration: '/studio/new',
            styleRemix: '/studio/remix',
            newStyleRemix: '/studio/remix/new',
            trackSeparation: '/studio/separation',
            newTrackSeparation: '/studio/separation/new',
            trackAnalysis: '/studio/analysis',
            newTrackAnalysis: '/studio/analysis/new',
            midiTranscription: '/studio/midi',
            newMidiTranscription: '/studio/midi/new',
            lyricsTranscription: '/studio/lyrics',
            newLyricsTranscription: '/studio/lyrics/new',
            preview: {
                track: '/studio/track',
                midi: '/studio/track/midi',
                karaoke: '/studio/track/karaoke',
            },
        },
        settings: '/settings',
        preview: {
            track: '/preview',
            midi: '/preview/midi',
            karaoke: '/preview/karaoke',
        },
    } as const,
    description:
        'Mu2Mi is an open source, AI-powered toolkit for all your musical needs. Remove vocals, isolate instruments, transcribe lyrics and instruments, generate and remix songs.',
    links: {
        github: 'https://github.com/FelixNgFender/Mu2Mi',
        discord: 'https://discord.gg/7BkTD7RNRG',
        twitter: 'https://twitter.com/felixcantcode',
        statusPage: 'https://status.mu2mi.com/status/mu2mi',
    },
    twitter: {
        site: '@felixcantcode',
        creator: '@felixcantcode',
    },
    keywords: ['music', 'production', 'ai', 'vocals', 'instruments', 'lyrics'],
    category: 'technology',
};

export type SiteConfig = typeof siteConfig;
