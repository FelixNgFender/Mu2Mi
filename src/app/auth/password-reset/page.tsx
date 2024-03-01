import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Metadata } from 'next';

import { PasswordResetForm } from './password-reset-form';

export const metadata: Metadata = {
    title: 'Password Reset',
};

const PasswordResetPage = async () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="bg-gradient !bg-cover !bg-clip-text !bg-center pb-1 text-transparent">
                    Forgot your password?
                </CardTitle>
                <CardDescription className="max-w-md text-sm text-muted-foreground">
                    Enter the email address associated with your account, and
                    we&apos;ll send you a link to reset your password.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
                <PasswordResetForm />
            </CardContent>
        </Card>
    );
};

export default PasswordResetPage;
