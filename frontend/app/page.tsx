import AudioUploadForm from "./AudioUploadForm";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Page() {
  return (
    <main className="flex flex-col items-center gap-4 antialiased bg-gray-200 min-h-screen p-4">
      <Navbar></Navbar>
      <AudioUploadForm></AudioUploadForm>
      <Footer></Footer>
    </main>
  );
}
