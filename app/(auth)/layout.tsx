import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

import { cn } from "@/lib/utils";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="h-screen bg-gradient">
      <div className="flex h-full flex-col items-center justify-center p-6">
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "py-6 mb-6 flex items-center"
          )}
        >
          <Image
            width={32}
            height={32}
            className="mr-2"
            src="/icons/favicon-32x32.png"
            alt="logo"
          />
          <span className="bg-gradient !bg-clip-text text-transparent !bg-cover !bg-center scroll-m-20 text-2xl font-extrabold tracking-tight">
            Mu2Mi
          </span>
        </Link>
        <div className="w-full space-y-4 p-6 sm:max-w-lg sm:p-8 md:space-y-6">
          {children}
        </div>
      </div>
    </main>
  );
};

export default AuthLayout;
