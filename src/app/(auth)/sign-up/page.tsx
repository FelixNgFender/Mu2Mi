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
import { getPageSession } from '@/src/server/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { SignUpForm } from './_components/sign-up-form';

const SignUpPage = async () => {
    const session = await getPageSession();
    if (session) {
        if (!session.user.emailVerified) redirect('/email-verification');
        redirect('/');
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Create an account</CardTitle>
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
                        <span>Sign up with Google</span>
                    </Link>
                    <Link
                        href="/sign-in/facebook"
                        className={buttonVariants({ variant: 'secondary' })}
                    >
                        <span>
                            <Icons.facebook className="mr-2 h-4 w-4" />
                        </span>
                        <span>Sign up with Facebook</span>
                    </Link>
                    <Link
                        href="/sign-in/apple"
                        className={buttonVariants({ variant: 'secondary' })}
                    >
                        <span>
                            <Icons.apple className="mr-2 h-4 w-4" />
                        </span>
                        <span>Sign up with Apple</span>
                    </Link>
                    <Link
                        href="/sign-in/twitter"
                        className={buttonVariants({ variant: 'secondary' })}
                    >
                        <span>
                            <Icons.twitter className="mr-2 h-4 w-4" />
                        </span>
                        <span>Sign up with X</span>
                    </Link>
                </div>

                <div className="flex items-center">
                    <Separator className="flex-1" />
                    <span className="px-4 text-sm text-muted-foreground">
                        or
                    </span>
                    <Separator className="flex-1" />
                </div>
                <SignUpForm />
            </CardContent>
            <CardFooter>
                <p className="text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link
                        href="/sign-in"
                        className="underline underline-offset-2 hover:text-primary"
                    >
                        Sign in
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
};

export default SignUpPage;
