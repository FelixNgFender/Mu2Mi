import { siteConfig } from '@/config/site';
import { getUserSession } from '@/models/user';
import { redirect } from 'next/navigation';

const ProfilePage = async () => {
    const { user } = await getUserSession();

    if (!user) {
        return redirect(siteConfig.paths.auth.signIn);
    }

    if (!user.emailVerified) {
        return redirect(siteConfig.paths.auth.emailVerification);
    }

    return (
        <>
            <h1>Profile</h1>
            <p>User id: {user.id}</p>
            <p>Name: {user.username}</p>
        </>
    );
};

export default ProfilePage;
