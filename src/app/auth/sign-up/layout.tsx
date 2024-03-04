import { siteConfig } from '@/config/site';
import { getUserSession } from '@/models/user';
import { redirect } from 'next/navigation';

type SignUpLayoutProps = {
    children: React.ReactNode;
};

const SignUpLayout = async ({ children }: SignUpLayoutProps) => {
    const { user } = await getUserSession();
    if (user) {
        if (!user.emailVerified) {
            return redirect(siteConfig.paths.auth.emailVerification);
        }
        return redirect(siteConfig.paths.studio.home);
    }
    return <>{children}</>;
};

export default SignUpLayout;
