import { siteConfig } from '@/config/site';
import { getUserSession } from '@/models/user';
import { redirect } from 'next/navigation';

interface NewPasswordLayoutProps {
    children: React.ReactNode;
}

const NewPasswordLayout = async ({ children }: NewPasswordLayoutProps) => {
    const { user } = await getUserSession();
    if (user) {
        if (!user.emailVerified)
            return redirect(siteConfig.paths.auth.emailVerification);
        return redirect(siteConfig.paths.studio.home);
    }

    return <>{children}</>;
};

export default NewPasswordLayout;
