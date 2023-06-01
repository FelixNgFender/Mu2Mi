import os
from spleeter.audio import Codec
from django.apps import AppConfig

from spleeter.separator import Separator
from spleeter.audio.adapter import AudioAdapter

class SeparateConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'separate'
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    SPLEETER_CONFIG = "5stems" + "-16kHz"
    CONFIG_FOLDER = os.path.join(BASE_DIR, 'separate/config/spleeter/')
    CONFIG_FILE = os.path.join(CONFIG_FOLDER, SPLEETER_CONFIG + ".json")
    separator = Separator(CONFIG_FILE)
    AUDIO_LOADER = AudioAdapter.default()
    SAMPLE_RATE = 44100
    OUTPUT_PATH = os.path.join(BASE_DIR, 'separate/media/processed/')
    SAVE_PATH = os.path.join(BASE_DIR, 'separate/media/source/')
    ALLOWED_EXTENSIONS = ["mp3", "wav", "flac", "aac", "ogg", "m4a"]
    OUTPUT_EXTENSION = Codec.MP3
    MAX_FILE_SIZE = 50000000 # 50MB
    OUTPUT_BITRATE = "128k"
    