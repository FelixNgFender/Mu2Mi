import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Page() {
  return (
    <main className="antialiased bg-gray-200 min-h-screen p-8">
    <Navbar></Navbar>
    <Link href="/">Go back</Link>
    <Footer></Footer>
  </main>
  );
}
