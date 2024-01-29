import { getUserSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

interface NewPasswordLayoutProps {
    children: React.ReactNode;
}

const NewPasswordLayout = async ({ children }: NewPasswordLayoutProps) => {
    const { user } = await getUserSession();
    if (user) {
        if (!user.emailVerified) return redirect('/auth/email-verification');
        return redirect('/');
    }

    return <>{children}</>;
};

export default NewPasswordLayout;
