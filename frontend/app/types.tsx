type ProcessedTrack = {
  id: number;
    name: string;
    artist: string;
    model: string;
    codec: string;
    bitRate: string;
    parts: {
        vocal: string | undefined;
        bass: string | undefined;
        other: string | undefined;
        piano: string | undefined;
        drums: string | undefined;
    };
    midi: {
        vocal: string | undefined;
        bass: string | undefined;
        other: string | undefined;
        piano: string | undefined;
        drums: string | undefined;
    };
};
