import { FeatureHeader } from '../feature-header';
import { TrackTable } from '../track-table';

const MidiTranscriptionPage = async () => {
    return (
        <>
            <FeatureHeader
                title="MIDI Transcription"
                href="midi/new"
                ctaLabel="Upload Tracks"
            />
            <TrackTable filter="midiTranscriptionStatus" />
        </>
    );
};

export default MidiTranscriptionPage;
