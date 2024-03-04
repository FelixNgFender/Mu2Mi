import { siteConfig } from '@/config/site';

import { FeatureHeader } from '../feature-header';
import { TrackTable } from '../track-table';

const MidiTranscriptionPage = async () => {
    return (
        <>
            <FeatureHeader
                title="MIDI Transcription"
                href={siteConfig.paths.studio.newMidiTranscription}
                ctaLabel="Upload Tracks"
            />
            <TrackTable filter="midiTranscriptionStatus" />
        </>
    );
};

export default MidiTranscriptionPage;
