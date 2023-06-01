import re
import os
import uuid
import zipfile

from pathlib import Path
from basic_pitch.inference import predict_and_save
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import FileResponse

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

        if audio_file.name.split(".")[-1] not in SeparateConfig.ALLOWED_EXTENSIONS:
            return Response({"error": "File extension not allowed"}, status=400)
        if audio_file.size > SeparateConfig.MAX_FILE_SIZE:
            return Response({"error": "File size too large"}, status=400)

        # generate unique identifier
        identifier = str(uuid.uuid4())

        file_path = os.path.join(SeparateConfig.SAVE_PATH, identifier)

        with open(file_path, "wb") as file:
            file.write(audio_file.read())

        truncated_filename = Path(audio_file.name).stem

        SeparateConfig.separator.separate_to_file(
            audio_descriptor=file_path,
            destination=SeparateConfig.OUTPUT_PATH + identifier,
            codec=SeparateConfig.OUTPUT_EXTENSION,
            bitrate=SeparateConfig.OUTPUT_BITRATE,
            filename_format=truncated_filename
            + "({instrument})[spleeter_"
            + re.sub(r"-", "_", SeparateConfig.SPLEETER_CONFIG)
            + "].{codec}",
            synchronous=True,
        )

        # Pipe each file in output folder through basic pitch
        audio_paths = [
            SeparateConfig.OUTPUT_PATH + identifier + "/" + file
            for file in os.listdir(SeparateConfig.OUTPUT_PATH + identifier)
        ]
        predict_and_save(
            audio_paths,
            SeparateConfig.OUTPUT_PATH + identifier,
            save_midi=True,
            sonify_midi=False,
            save_model_outputs=False,
            save_notes=False,
        )

        # Create empty zip file at zip_file_path
        zip_file_path = os.path.join(SeparateConfig.OUTPUT_PATH + identifier + ".zip")

        zip_file = zipfile.ZipFile(zip_file_path, "w")

        # write each file from output folder to zip file
        for file in os.listdir(SeparateConfig.OUTPUT_PATH + identifier):
            zip_file.write(
                SeparateConfig.OUTPUT_PATH + identifier + "/" + file,
                arcname=file,
                compress_type=zipfile.ZIP_DEFLATED,
            )
        zip_file.close()

         # Delete source audio file
        os.remove(file_path)

        # Delete output dir
        for file in os.listdir(SeparateConfig.OUTPUT_PATH + identifier):
            os.remove(SeparateConfig.OUTPUT_PATH + identifier + "/" + file)
        os.rmdir(SeparateConfig.OUTPUT_PATH + identifier)

        # Save zip file
        response = FileResponse(open(zip_file_path, "rb"), as_attachment=True)

        # Delete zip file
        os.remove(zip_file_path)

        return response
