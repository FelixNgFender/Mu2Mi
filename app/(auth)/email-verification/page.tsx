import { getPageSession } from '@/app/_server/auth';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { redirect } from 'next/navigation';

import { EmailVerificationForm } from './_components/email-verification-form';

const EmailVerificationPage = async () => {
    const session = await getPageSession();
    if (!session) redirect('/sign-in');
    if (session.user.emailVerified) redirect('/');
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <h4 className="text-xl font-bold md:text-2xl">
                        Email verification
                    </h4>
                </CardTitle>
                <CardDescription>
                    <p className="text-sm text-muted-foreground">
                        Your email verification link was sent to your inbox.
                    </p>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
                <EmailVerificationForm />
            </CardContent>
        </Card>
    );
};

export default EmailVerificationPage;
