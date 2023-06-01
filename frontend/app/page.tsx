"use client";

import AudioUploadForm from "./AudioUploadForm";
import ModelModal from "./ModelModal";
import { useRef } from "react";

export default function Page() {
  const modelModalRef = useRef<HTMLDialogElement>(null);
  const openModelModal = () => {
    modelModalRef.current?.showModal();
  };
  const closeModelModal = () => {
    modelModalRef.current?.close();
  };
  return (
    <>
      <AudioUploadForm openModelModal={openModelModal}></AudioUploadForm>
      <ModelModal modelModalRef={modelModalRef} closeModelModal={closeModelModal}></ModelModal>
    </>
  );
}
