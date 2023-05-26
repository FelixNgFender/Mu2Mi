import Navbar from "../Navbar";
import Link from "next/link";

export default function Page() {
  return (
    <main className="antialiased bg-gray-200 min-h-screen p-8">
    <Navbar></Navbar>
    <Link href="/">Go back</Link>
  </main>
  );
}
