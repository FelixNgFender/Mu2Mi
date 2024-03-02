import { getUserSession } from '@/models/user';
import { redirect } from 'next/navigation';

type SignUpLayoutProps = {
    children: React.ReactNode;
};

const SignUpLayout = async ({ children }: SignUpLayoutProps) => {
    const { user } = await getUserSession();
    if (user) {
        if (!user.emailVerified) {
            return redirect('/auth/email-verification');
        }
        return redirect('/');
    }
    return <>{children}</>;
};

export default SignUpLayout;
