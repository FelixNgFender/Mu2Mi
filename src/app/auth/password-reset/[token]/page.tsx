import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { siteConfig } from '@/config/site';
import { getUserSession } from '@/models/user';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { NewPasswordForm } from './new-password-form';

export const metadata: Metadata = {
    title: 'New Password',
};

const SignUpPage = async ({
    params,
}: {
    params: {
        token: string;
    };
}) => {
    const { user } = await getUserSession();

    if (user) {
        if (!user.emailVerified)
            return redirect(siteConfig.paths.auth.emailVerification);
        return redirect(siteConfig.paths.studio.home);
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
