"use client";

import React, { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";

export default function AudioDropZone() {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      console.log("No files accepted");
    } else {
      console.log(acceptedFiles);
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    accept: {
      "audio/wav": [".wav"],
      "audio/webm": [".webm"],
      "audio/ogg": [".ogg"],
      "audio/opus": [".opus"],
      "audio/mpeg": [".mp3"],
      "audio/aac": [".aac"],
    },
    maxFiles: 1,
    onDrop,
  });

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  return (
    <div {...getRootProps({ style })}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the file here</p>
      ) : (
        <p>Drag and drop an audio file, or click to select</p>
      )}
    </div>
  );
}

const baseStyle = {
  width: "100%",
  maxWidth: "1000px",
  height: "200px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 10,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const focusedStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};
