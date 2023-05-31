import re
import os
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from spleeter.audio import Codec

# from rest_framework.authentication import TokenAuthentication
# from rest_framework.permissions import IsAuthenticated

from django.shortcuts import render
from .apps import SeparateConfig

class SpleeterModelSeparate(APIView):
    # authentication_classes = [TokenAuthentication]
    # permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        # frontend form has "upload" and "ytb-link" fields, prioritizing "upload"
        if request.data.get("upload"):
            audio_file = request.data["upload"]
        elif request.data.get("ytb-link"):
            audio_file = request.data["ytb-link"]
        else:
            return Response({"error": "No audio file found"}, status=400)
        # Temporarily save audio file to the desired path
        file_path = os.path.join(SeparateConfig.SAVE_PATH, audio_file.name)
        with open(file_path, "wb") as file:
            file.write(audio_file.read())

        # Separate audio file
        identifier = audio_file.name.split(".")[0]
        SeparateConfig.separator.separate_to_file(
            audio_descriptor=file_path,
            destination=SeparateConfig.OUTPUT_PATH + identifier,
            codec=Codec.MP3,
            bitrate="320k",
            filename_format="{filename}({instrument})[spleeter_"
            + re.sub(r"-", "_", SeparateConfig.SPLEETER_CONFIG)
            + "].{codec}",
            synchronous=True,
        )

        # Delete source audio file
        os.remove(file_path)

        # Return respons, print Hello World on the browser
        
