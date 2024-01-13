import { EmailVerificationForm } from '@/components/auth/email-verification-form';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { getPageSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

const EmailVerificationPage = async () => {
    const session = await getPageSession();
    if (!session) redirect('/auth/sign-in');
    if (session.user.emailVerified) redirect('/');
    return (
        <Card>
            <CardHeader>
                <CardTitle className="bg-gradient !bg-cover !bg-clip-text !bg-center text-transparent">
                    Email verification
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
