import { getPageSession } from '@/app/_server/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';

import { NewPasswordForm } from './_components/new-password-form';

const SignUpPage = async ({
    params,
}: {
    params: {
        token: string;
    };
}) => {
    const session = await getPageSession();
    if (session) {
        if (!session.user.emailVerified) redirect('/email-verification');
        redirect('/');
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <h4 className="text-xl font-bold md:text-2xl">
                        Set your new password
                    </h4>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
                <NewPasswordForm token={params.token} />
            </CardContent>
        </Card>
    );
};

export default SignUpPage;