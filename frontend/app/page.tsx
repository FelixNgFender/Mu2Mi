import AudioDropzone from "./AudioDropzone";
import Navbar from "./Navbar";
import YoutubeUpload from "./YoutubeUpload";

export default function Page() {
  return (
    <main className="flex flex-col items-center gap-4 antialiased bg-gray-200 min-h-screen p-8">
      <Navbar></Navbar>
      <div
        className="flex flex-col gap-2 w-full max-w-screen-xl"
        role="presentation"
      >
        <AudioDropzone></AudioDropzone>
        <YoutubeUpload></YoutubeUpload>
      </div>
    </main>
  );
}
