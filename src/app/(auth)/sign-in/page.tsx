import { getPageSession } from '@/src/app/_server/auth';
import { Icons } from '@/src/components/icons';
import { buttonVariants } from '@/src/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/src/components/ui/card';
import { Separator } from '@/src/components/ui/separator';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { SignInForm } from './_components/sign-in-form';

const SignInPage = async () => {
    const session = await getPageSession();
    if (session) {
        if (!session.user.emailVerified) redirect('/email-verification');
        redirect('/');
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Welcome back</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
                <div className="inline-flex w-full flex-col space-y-2 overflow-hidden md:space-y-4">
                    <Link
                        href="/sign-in/google"
                        className={buttonVariants({ variant: 'secondary' })}
                    >
                        <span>
                            <Icons.google className="mr-2 h-4 w-4" />
                        </span>
                        <span>Continue with Google</span>
                    </Link>
                    <Link
                        href="/sign-in/facebook"
                        className={buttonVariants({ variant: 'secondary' })}
                    >
                        <span>
                            <Icons.facebook className="mr-2 h-4 w-4" />
                        </span>
                        <span>Continue with Facebook</span>
                    </Link>
                    <Link
                        href="/sign-in/github"
                        className={buttonVariants({ variant: 'secondary' })}
                    >
                        <span>
                            <Icons.apple className="mr-2 h-4 w-4" />
                        </span>
                        <span>Continue with Apple</span>
                    </Link>
                    <Link
                        href="/sign-in/twitter"
                        className={buttonVariants({ variant: 'secondary' })}
                    >
                        <span>
                            <Icons.twitter className="mr-2 h-4 w-4" />
                        </span>
                        <span>Continue with X</span>
                    </Link>
                </div>

                <div className="flex items-center">
                    <Separator className="flex-1" />
                    <span className="px-4 text-sm text-muted-foreground">
                        or
                    </span>
                    <Separator className="flex-1" />
                </div>
                <SignInForm />
            </CardContent>
            <CardFooter>
                <p className="text-sm text-muted-foreground">
                    New to Mu2Mi?{' '}
                    <Link
                        href="/sign-up"
                        className="underline underline-offset-2 hover:text-primary"
                    >
                        Create an account
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
};

export default SignInPage;
