""" Test script to run Spleeter on a batch of files. """

import re
from spleeter.separator import Separator
from spleeter.audio import Codec

SPLEETER_16KHZ_5STEMS = "5stems-16kHz"

separator = Separator("./config/spleeter/" + SPLEETER_16KHZ_5STEMS + ".json")

# Synchronous separation
separator.separate_to_file(
    audio_descriptor=\
    "./media/source/jpop/y2mate.com - Mrs GREEN APPLEケセラセラOfficial Music Video.mp3",
    destination="media/separate/jpop",
    codec=Codec.MP3,
    bitrate="320k",
    filename_format="{filename}({instrument})[spleeter_"
    + re.sub(r"-", "_", SPLEETER_16KHZ_5STEMS)
    + "].{codec}",
    synchronous=True,
)

# Asynchronous separation (batch)
audio_sources = [
    "./media/source/acoustic/y2mate.com - Aimer  カタオモイ  THE FIRST TAKE.mp3",
    "./media/source/edm/y2mate.com - Snails House  Pixel Galaxy Official MV.mp3",
    "./media/source/funk/y2mate.com - Dirty Loops  Cory Wong  Thriller.mp3",
    "./media/source/metal/y2mate.com - MAN WITH A MISSIONmilet絆ノ奇跡Music Video.mp3",
]

for audio in audio_sources:
    identifier = audio.split("/")[3]
    separator.separate_to_file(
        audio_descriptor=audio,
        destination="./media/separate/" + identifier,
        codec=Codec.MP3,
        bitrate="320k",
        filename_format="{filename}({instrument})[spleeter_"
        + re.sub(r"-", "_", SPLEETER_16KHZ_5STEMS)
        + "].{codec}",
        synchronous=False,
    )

separator.join()
