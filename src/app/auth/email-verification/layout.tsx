import { siteConfig } from '@/config/site';
import { getUserSession } from '@/models/user';
import { redirect } from 'next/navigation';

type EmailVerificationLayoutProps = {
    children: React.ReactNode;
};

const EmailVerificationLayout = async ({
    children,
}: EmailVerificationLayoutProps) => {
    const { user } = await getUserSession();
    if (!user) {
        return redirect(siteConfig.paths.auth.signIn);
    }
    if (user.emailVerified) {
        return redirect(siteConfig.paths.studio.home);
    }
    return <>{children}</>;
};

export default EmailVerificationLayout;
