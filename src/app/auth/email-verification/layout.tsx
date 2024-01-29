import { getUserSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

type EmailVerificationLayoutProps = {
    children: React.ReactNode;
};

const EmailVerificationLayout = async ({
    children,
}: EmailVerificationLayoutProps) => {
    const { user } = await getUserSession();
    if (!user) {
        return redirect('/auth/sign-in');
    }
    if (user.emailVerified) {
        return redirect('/');
    }
    return <>{children}</>;
};

export default EmailVerificationLayout;
