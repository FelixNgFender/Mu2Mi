import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Mixer from "./Mixer";
import Link from "next/link";

import processsedTrackData from "../../public/jpop.json";

export default function Page() {
  const track = processsedTrackData as ProcessedTrack;
  return (
    <main className="antialiased bg-gray-200 min-h-screen p-8">
      <Navbar></Navbar>
      <Mixer track={track}></Mixer>
      <Link href="/">Go back</Link>
      <Footer></Footer>
    </main>
  );
}
