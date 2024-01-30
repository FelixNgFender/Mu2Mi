import { Button } from '@/components/ui/button';
import { getUserSession } from '@/lib/auth';

const ProfilePage = async () => {
    const { user } = await getUserSession();
    if (!user) {
        return null;
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
