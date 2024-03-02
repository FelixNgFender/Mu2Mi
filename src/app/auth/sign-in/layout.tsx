import { getUserSession } from '@/models/user';
import { redirect } from 'next/navigation';

type SignInLayoutProps = {
    children: React.ReactNode;
};

const SignInLayout = async ({ children }: SignInLayoutProps) => {
    const { user } = await getUserSession();
    if (user) {
        if (!user.emailVerified) {
            return redirect('/auth/email-verification');
        }
        return redirect('/');
    }

    return <>{children}</>;
};

export default SignInLayout;
