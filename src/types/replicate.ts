export const models = [
    {
        name: 'htdemucs',
        description:
            'First version of Hybrid Transformer Demucs. Trained on MusDB + 800 songs. Default model.',
    },
    {
        name: 'htdemucs_ft',
        description:
            'Fine-tuned version of htdemucs, separation will take 4 times more time but might be a bit better. Same training set as htdemucs.',
    },
    {
        name: 'htdemucs_6s',
        description:
            '6 sources version of htdemucs, with piano and guitar being added as sources. Note that the piano source is not working great at the moment.',
    },
    {
        name: 'hdemucs_mmi',
        description: 'Hybrid Demucs v3, retrained on MusDB + 800 songs.',
    },
    {
        name: 'mdx',
        description:
            'Trained only on MusDB HQ, winning model on track A at the MDX challenge.',
    },
    {
        name: 'mdx_extra',
        description:
            'Trained with extra training data (including MusDB test set), ranked 2nd on the track B of the MDX challenge.',
    },
    {
        name: 'mdx_q',
        description:
            'Quantized version of the previous models. Smaller download and storage but quality can be slightly worse.',
    },
    {
        name: 'mdx_extra_q',
        description:
            'Quantized version of the previous models. Smaller download and storage but quality can be slightly worse.',
    },
] as const;
