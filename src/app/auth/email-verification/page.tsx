import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import {
    EmailVerificationForm,
    ResendVerificationCodeButton,
} from './email-verification-form';

const EmailVerificationPage = async () => {
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
