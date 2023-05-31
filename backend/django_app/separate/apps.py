import os
from django.apps import AppConfig

from spleeter.separator import Separator

class SeparateConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'separate'
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    # DLMODEL_FOLDER = os.path.join(BASE_DIR, 'separate/separators/')
    # DLMODEL_FILE = os.path.join(DLMODEL_FOLDER, "IRISRandomForestClassifier.joblib")
    # mlmodel = load(DLMODEL_FILE)
    SPLEETER_CONFIG = "2stems" # + "-16kHz"
    CONFIG_FOLDER = os.path.join(BASE_DIR, 'separate/config/spleeter/')
    CONFIG_FILE = os.path.join(CONFIG_FOLDER, SPLEETER_CONFIG + ".json")
    separator = Separator(CONFIG_FILE)
    OUTPUT_PATH = os.path.join(BASE_DIR, 'separate/media/separate_2stems/') # + "_16khz/"
    SAVE_PATH = os.path.join(BASE_DIR, 'separate/media/source/')