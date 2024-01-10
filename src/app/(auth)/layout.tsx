import { buttonVariants } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className="bg-gradient flex flex-1 flex-col items-center justify-center p-6">
            <Link
                href="/"
                className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'mb-6 flex items-center py-6',
                )}
            >
                <Image
                    width={32}
                    height={32}
                    className="mr-2"
                    src="/icons/favicon-32x32.png"
                    alt="logo"
                />
                <span className="bg-gradient scroll-m-20 !bg-cover !bg-clip-text !bg-center text-2xl font-extrabold tracking-tight text-transparent">
                    Mu2Mi
                </span>
            </Link>
            <div className="w-full space-y-4 sm:max-w-lg md:space-y-6">
                {children}
            </div>
        </main>
    );
};

export default AuthLayout;
