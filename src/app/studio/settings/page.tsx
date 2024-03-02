import { getUserSession } from '@/models/user';

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
