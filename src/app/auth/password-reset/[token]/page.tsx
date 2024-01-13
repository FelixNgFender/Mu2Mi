import { NewPasswordForm } from '@/components/auth/new-password-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getPageSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

const SignUpPage = async ({
    params,
}: {
    params: {
        token: string;
    };
}) => {
    const session = await getPageSession();
    if (session) {
        if (!session.user.emailVerified) redirect('/auth/email-verification');
        redirect('/');
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle className="bg-gradient !bg-cover !bg-clip-text !bg-center text-transparent">
                    Set your new password
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
                <NewPasswordForm token={params.token} />
            </CardContent>
        </Card>
    );
};

export default SignUpPage;
