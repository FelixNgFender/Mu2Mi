"use client";

export default function ModelModal({
  modelModalRef,
  closeModelModal,
}: {
  modelModalRef: React.RefObject<HTMLDialogElement>;
  closeModelModal: () => void;
}) {
  const labelClasses =
    "block text-sm text-white";
  const inputClasses =
    "border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5";
  const buttonClasses =
  "bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
  return (
    <dialog className="flex flex-col gap-4 bg-sky-400 rounded-lg" id="model-modal" ref={modelModalRef}>
      <div className="flex flex-col gap-2">
        <label className={labelClasses} htmlFor="model" form="audio-upload-form">
          Source separation model
        </label>
        <select className={inputClasses} id="model" form="audio-upload-form">
          <option value="2stems">
            Spleeter 2 Stems (Vocals & Accompaniment)
          </option>
          <option value="2stems-16kHz">
            Spleeter 2 Stems 16kHz (Vocals & Accompaniment)
          </option>
          <option value="4stems">
            Spleeter 4 Stems (Vocals, Drums, Bass, Other)
          </option>
          <option value="4stems-16kHz">
            Spleeter 4 Stems 16kHz (Vocals, Drums, Bass, Other)
          </option>
          <option value="5stems">
            Spleeter 5 Stems (Vocals, Drums, Bass, Piano, Other)
          </option>
          <option value="5stems-16kHz">
            Spleeter 5 Stems 16kHz (Vocals, Drums, Bass, Piano, Other)
          </option>
        </select>
        <label className={labelClasses} htmlFor="tempo" form="audio-upload-form">
          Song tempo
        </label>
        <input
          className={inputClasses}
          id="tempo"
          type="number"
          min="1"
          max="500"
          defaultValue="120"
          required
          form="audio-upload-form"
        />
      </div>
      <div className="flex justify-center gap-8">
        <button
          className={buttonClasses}
          id="cancel"
          value="cancel"
          onClick={closeModelModal}
        >
          <span>Cancel</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 -960 960 960"
            width="24"
          >
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
          </svg>
        </button>
        <button
          className={buttonClasses}
          form="audio-upload-form"
          type="submit"
        >
          <span>Submit</span>
          <svg
            className="mr-1"
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 -960 960 960"
            width="24"
          >
            <path d="M220-160q-24 0-42-18t-18-42v-143h60v143h520v-143h60v143q0 24-18 42t-42 18H220Zm230-153v-371L330-564l-43-43 193-193 193 193-43 43-120-120v371h-60Z" />
          </svg>
        </button>
      </div>
    </dialog>
  );
}
