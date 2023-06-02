import Navbar from "@/components/Navbar";
import "./globals.css";
import { Inter } from "next/font/google";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Mu2Mi",
  description: "Generate MIDI multitrack from audio",
  themeColor: "#ffffff",
  manifest: "./site.webmanifest",
};

// Add a navbar to the top of the page
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className + " flex flex-col items-center gap-4 antialiased bg-gray-200 min-h-screen p-4"}>
        <Navbar></Navbar>
        <main className="flex flex-1 w-full justify-center">
          {children}
        </main>
        <Footer></Footer>
      </body>
    </html>
  );
}
