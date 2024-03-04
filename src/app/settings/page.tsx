import { siteConfig } from '@/config/site';
import { getUserSession } from '@/models/user';
import { UserDTO } from '@/models/user';
import { redirect } from 'next/navigation';

import { UserForm } from './user-form';

const ProfilePage = async () => {
    const { user } = await getUserSession();

    if (!user) {
        return redirect(siteConfig.paths.auth.signIn);
    }

    if (!user.emailVerified) {
        return redirect(siteConfig.paths.auth.emailVerification);
    }

    const userDTO: UserDTO = {
        id: user.id,
        username: user.username,
    };

    return (
        <section className="container relative flex h-full max-w-md flex-1 flex-col justify-center space-y-4 py-8">
            <UserForm userDTO={userDTO} />
        </section>
    );
};

export default ProfilePage;
