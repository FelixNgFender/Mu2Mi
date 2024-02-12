import dynamic from 'next/dynamic';

const AudioPlayer = dynamic(() => import('./audio-player'), {
    ssr: false,
    // TODO: replace this
    loading: () => <p>Loading...</p>,
});

const AudioPreviewPage = async () => {
    return <AudioPlayer assetLinks={[]} />;
};

export default AudioPreviewPage;
