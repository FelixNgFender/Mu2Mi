"use client";

import React, { useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";

const maxFileNameLength = 50;
const maxFileSize = 50000000; // 50 MB

export default function AudioDropZone() {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      console.log("No files accepted");
    } else {
      console.log("Accepted file:", acceptedFiles[0]);
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isFocused,
    isDragAccept,
    isDragReject,
    acceptedFiles,
    fileRejections,
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
    validator: fileValidator,
  });

  const acceptedFileItems = acceptedFiles.map((file) => (
    <li key={file.name}>
      {file.name} - {file.size} bytes
    </li>
  ));

  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <li key={file.name}>
      {file.name} - {file.size} bytes 
      <ul>
        {errors.map((e) => (
          <li key={e.code}>{e.message}</li>
        ))}
      </ul>
    </li>
  ));

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
      <ul>{acceptedFileItems}</ul>
      <ul>{fileRejectionItems}</ul>
    </div>
  );
}

function fileValidator(file: File) {
  if (file.name.length > maxFileNameLength) {
    return {
      code: "file-name-too-long",
      message: `File name is too long. Maximum length is ${maxFileNameLength} characters.`,
    };
  }
  if (file.size > maxFileSize) {
    return {
      code: "file-too-large",
      message: `File is too large. Maximum size is ${maxFileSize} bytes.`,
    };
  }
  return null;
}

const baseStyle = {
  width: "100%",
  maxWidth: "1000px",
  height: "200px",
  display: "flex",
  flexDirection: "column" as "column", // TypeScript is weird
  alignItems: "center",
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
