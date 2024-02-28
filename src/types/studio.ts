import { StaticImageData } from 'next/image';

export type Preset = {
    id: string;
    icon: StaticImageData;
    name: string;
    description: string;
    labels: string[];
    onClick: () => void;
};

export type TrackStatusColumn =
    | 'musicGenerationStatus'
    | 'styleRemixStatus'
    | 'trackSeparationStatus'
    | 'trackAnalysisStatus'
    | 'midiTranscriptionStatus'
    | 'lyricsTranscriptionStatus';
