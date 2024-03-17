import { siteConfig } from '@/config/site';
import { getUserSession } from '@/models/user';
import { redirect } from 'next/navigation';

type SignInLayoutProps = {
    children: React.ReactNode;
};

const SignInLayout = async ({ children }: SignInLayoutProps) => {
    const { user } = await getUserSession();
    if (user) {
        if (!user.emailVerified) {
            return redirect(siteConfig.paths.auth.emailVerification);
        }
        return redirect(siteConfig.paths.studio.home);
    }

    return <>{children}</>;
};

export default SignInLayout;
