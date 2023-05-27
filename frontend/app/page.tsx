import AudioDropzone from "./AudioDropzone";
import Navbar from "./Navbar";
import YoutubeUpload from "./YoutubeUpload";

export default function Page() {
  return (
    <main className="flex flex-col items-center gap-4 antialiased bg-gray-200 min-h-screen p-8">
      <Navbar></Navbar>
      <AudioDropzone></AudioDropzone>
      <YoutubeUpload></YoutubeUpload>
    </main>
  );
}
