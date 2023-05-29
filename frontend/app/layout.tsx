import "./globals.css";
import { Inter } from "next/font/google";

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
      <body className={inter.className}>{children}</body>
    </html>
  );
}
