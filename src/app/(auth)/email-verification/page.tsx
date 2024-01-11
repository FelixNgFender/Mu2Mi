import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/src/components/ui/card';
import { getPageSession } from '@/src/server/auth';
import { redirect } from 'next/navigation';

import { EmailVerificationForm } from './_components/email-verification-form';

const EmailVerificationPage = async () => {
    const session = await getPageSession();
    if (!session) redirect('/sign-in');
    if (session.user.emailVerified) redirect('/');
    return (
        <Card>
            <CardHeader>
                <CardTitle>Email verification</CardTitle>
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
