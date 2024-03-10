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

import { SignInForm } from './sign-in-form';

export const metadata: Metadata = {
    title: 'Sign In',
};

const SignInPage = async () => {
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
                    Welcome back
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
                        <span>Continue with Google</span>
                    </Link>
                    {/* <Link
                        href={siteConfig.paths.auth.facebookOAuth}
                        className={buttonVariants({ variant: 'secondary' })}
                        prefetch={false}
                    >
                        <span>
                            <Icons.facebook className="mr-2 h-4 w-4 fill-current" />
                        </span>
                        <span>Continue with Facebook</span>
                    </Link> */}
                    <Link
                        href={siteConfig.paths.auth.githubOAuth}
                        className={buttonVariants({ variant: 'secondary' })}
                        prefetch={false}
                    >
                        <span>
                            <Icons.gitHub className="mr-2 h-4 w-4 fill-current" />
                        </span>
                        <span>Continue with GitHub</span>
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
                        href={siteConfig.paths.auth.signUp}
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
