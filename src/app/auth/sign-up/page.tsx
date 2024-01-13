import { SignUpForm } from '@/components/auth/sign-up-form';
import { Icons } from '@/components/icons';
import { buttonVariants } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getPageSession } from '@/server/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const SignUpPage = async () => {
    const session = await getPageSession();
    if (session) {
        if (!session.user.emailVerified) redirect('/auth/email-verification');
        redirect('/');
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle className="bg-gradient !bg-cover !bg-clip-text !bg-center text-transparent">
                    Create an account
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
                <div className="inline-flex w-full flex-col space-y-2 overflow-hidden md:space-y-4">
                    <Link
                        href="/auth/sign-in/google"
                        className={buttonVariants({ variant: 'secondary' })}
                    >
                        <span>
                            <Icons.google className="mr-2 h-4 w-4 fill-current" />
                        </span>
                        <span>Sign up with Google</span>
                    </Link>
                    <Link
                        href="/auth/sign-in/facebook"
                        className={buttonVariants({ variant: 'secondary' })}
                    >
                        <span>
                            <Icons.facebook className="mr-2 h-4 w-4 fill-current" />
                        </span>
                        <span>Sign up with Facebook</span>
                    </Link>
                    <Link
                        href="/auth/sign-in/github"
                        className={buttonVariants({ variant: 'secondary' })}
                    >
                        <span>
                            <Icons.gitHub className="mr-2 h-4 w-4 fill-current" />
                        </span>
                        <span>Sign up with GitHub</span>
                    </Link>
                    <Link
                        href="/auth/sign-in/twitter"
                        className={buttonVariants({ variant: 'secondary' })}
                    >
                        <span>
                            <Icons.twitter className="mr-2 h-4 w-4 fill-current" />
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
                        href="/auth/sign-in"
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
