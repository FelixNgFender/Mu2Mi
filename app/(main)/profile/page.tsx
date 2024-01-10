import { getPageSession } from '@/app/_server/auth';
import { redirect } from 'next/navigation';

const ProfilePage = async () => {
    const session = await getPageSession();
    if (!session) redirect('/sign-in');
    if (!session.user.emailVerified) redirect('/email-verification');
    return (
        <>
            <h1>Profile</h1>
            <p>User id: {session.user.userId}</p>
            <p>Name: {session.user.username}</p>
            <form action="/api/sign-out" method="post">
                <input type="submit" value="Sign out" />
            </form>
        </>
    );
};

export default ProfilePage;
