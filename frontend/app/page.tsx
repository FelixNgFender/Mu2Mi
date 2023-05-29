import AudioDropZone from "./AudioDropzone";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import YoutubeUpload from "./YoutubeUpload";

export default function Page() {
  return (
    <main className="flex flex-col items-center gap-4 antialiased bg-gray-200 min-h-screen p-4">
      <Navbar></Navbar>
      <div
        className="flex flex-col gap-2 w-full max-w-screen-xl flex-1"
        role="presentation"
      >
        <AudioDropZone ></AudioDropZone>
        <YoutubeUpload></YoutubeUpload>
      </div>
      <Footer></Footer>
    </main>
  );
}
