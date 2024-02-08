export type Asset = {
    id: string;
    url: string;
    type:
        | 'original'
        | 'vocals'
        | 'accompaniment'
        | 'bass'
        | 'drums'
        | 'guitar'
        | 'piano'
        | 'metronome'
        | null;
};
