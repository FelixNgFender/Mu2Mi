import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import { PasswordResetForm } from './_components/password-reset-form';

const PasswordResetPage = async () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    <h4 className="text-xl font-bold md:text-2xl">
                        Forgot your password?
                    </h4>
                </CardTitle>
                <CardDescription>
                    <p className="text-sm text-muted-foreground">
                        Enter the email address associated with your account,
                        and we&apos;ll send you a link to reset your password.
                    </p>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
                <PasswordResetForm />
            </CardContent>
        </Card>
    );
};

export default PasswordResetPage;