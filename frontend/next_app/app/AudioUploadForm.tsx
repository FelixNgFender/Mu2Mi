"use client";

import { useState } from "react";
import { API_SERVER } from "./settings";

const maxFileSize = 50 * 1024 * 1024; // 50MB

export default function AudioUploadForm({
  openModelModal,
}: {
  openModelModal: () => void;
}) {
  const [fileNames, setFileNames] = useState<string[]>([]);
  const buttonClasses =
    "self-center bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center";
  return (
    <form
      className="flex flex-col gap-3 w-full max-w-screen-xl"
      name="audio-upload-form"
      id="audio-upload-form"
      action={`${API_SERVER}/api/separate/`}
      method="post"
      encType="multipart/form-data"
    >
      <div className="flex items-center justify-center">
        <label
          htmlFor="upload"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-white hover:bg-slate-50"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              aria-hidden="true"
              className="w-10 h-10 mb-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
            <p className="mb-2 text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="hidden text-sm text-gray-500 dark:text-gray-400 sm:block">
              MP3, WAV, FLAC, AAC, OGG, or M4A (MAX. 50MB)
            </p>
          </div>
          <div className="flex items-center justify-center w-full h-12 text-center border-t border-gray-200">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {fileNames.length > 0 ? fileNames[0] : "No file selected"}
            </p>
          </div>
          <input
            name="upload"
            id="upload"
            type="file"
            accept=".mp3, .wav, .flac, .aac, .ogg, .m4a"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > maxFileSize) {
                  alert("File is too large");
                  e.preventDefault();
                } else {
                  setFileNames([file.name]);
                }
              }
            }}
          />
        </label>
      </div>

      <label htmlFor="ytb-link" className="hidden"></label>
      <input
        className="border-2 border-gray-300 rounded-lg p-2 w-full text-center "
        type="url"
        id="ytb-link"
        name="ytb-link"
        placeholder="Split stems from YouTube link (coming soon)"
        pattern="^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$"
        disabled
      />

      <button className={buttonClasses} type="button" onClick={openModelModal}>
        <span>Continue</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24"
          viewBox="0 -960 960 960"
          width="24"
        >
          <path d="m375-240-43-43 198-198-198-198 43-43 241 241-241 241Z" />
        </svg>
      </button>
    </form>
  );
}
