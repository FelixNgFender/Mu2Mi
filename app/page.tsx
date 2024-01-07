import Link from "next/link";
import { ModeToggle as ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ThemeToggle />
      <Link href="/sign-up">Sign up</Link>
      <Link href="/sign-in">Sign in</Link>
    </main>
  );
}
