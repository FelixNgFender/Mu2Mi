import dynamic from 'next/dynamic';

const MidiPlayer = dynamic(() => import('./midi-player'), {
    ssr: false,
    // TODO: replace this
    loading: () => <p>Loading...</p>,
});

const MidiPreviewPage = () => {
    return <MidiPlayer />;
};

export default MidiPreviewPage;
