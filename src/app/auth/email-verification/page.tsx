import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { siteConfig } from '@/config/site';
import { getUserSession } from '@/models/user';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import {
    EmailVerificationForm,
    ResendVerificationCodeButton,
} from './email-verification-form';

export const metadata: Metadata = {
    title: 'Email Verification',
};

const EmailVerificationPage = async () => {
    const { user } = await getUserSession();

    if (!user) {
        return redirect(siteConfig.paths.auth.signIn);
    }

    if (user.emailVerified) {
        return redirect(siteConfig.paths.studio.home);
    }

    return (
        <Card className="max-w-md">
            <CardHeader>
                <CardTitle className="bg-gradient !bg-cover !bg-clip-text !bg-center text-transparent">
                    Verify your email
                </CardTitle>
                <CardDescription>
                    We have sent a code to your email address
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
                <EmailVerificationForm />
            </CardContent>
            <CardFooter>
                <ResendVerificationCodeButton />
            </CardFooter>
        </Card>
    );
};

export default EmailVerificationPage;
