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
import { siteConfig } from '@/config/site';
import { getUserSession } from '@/models/user';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { SignUpForm } from './sign-up-form';

export const metadata: Metadata = {
    title: 'Sign Up',
};

const SignUpPage = async () => {
    const { user } = await getUserSession();

    if (user) {
        if (!user.emailVerified) {
            return redirect(siteConfig.paths.auth.emailVerification);
        }
        return redirect(siteConfig.paths.studio.home);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="bg-gradient !bg-cover !bg-clip-text !bg-center text-transparent">
                    Create an account
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
                <div className="inline-flex w-full flex-col space-y-2 overflow-hidden p-1 md:space-y-4">
                    <Link
                        href={siteConfig.paths.auth.googleOAuth}
                        className={buttonVariants({ variant: 'secondary' })}
                        prefetch={false}
                    >
                        <span>
                            <Icons.google className="mr-2 h-4 w-4 fill-current" />
                        </span>
                        <span>Sign up with Google</span>
                    </Link>
                    {/* <Link
                        href={siteConfig.paths.auth.facebookOAuth}
                        className={buttonVariants({ variant: 'secondary' })}
                        prefetch={false}
                    >
                        <span>
                            <Icons.facebook className="mr-2 h-4 w-4 fill-current" />
                        </span>
                        <span>Sign up with Facebook</span>
                    </Link> */}
                    <Link
                        href={siteConfig.paths.auth.githubOAuth}
                        className={buttonVariants({ variant: 'secondary' })}
                        prefetch={false}
                    >
                        <span>
                            <Icons.gitHub className="mr-2 h-4 w-4 fill-current" />
                        </span>
                        <span>Sign up with GitHub</span>
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
                        href={siteConfig.paths.auth.signIn}
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
