import { getUserSession } from '@/models/user';
import { redirect } from 'next/navigation';

const ProfilePage = async () => {
    const { user } = await getUserSession();

    if (!user) {
        return redirect('/auth/sign-in');
    }

    if (!user.emailVerified) {
        return redirect('/auth/email-verification');
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
