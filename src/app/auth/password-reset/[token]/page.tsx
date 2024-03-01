import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';

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
