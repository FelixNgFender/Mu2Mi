import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { siteConfig } from '@/config/site';
import { getUserSession } from '@/models/user';
import Link from 'next/link';
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
        <section className="container relative flex h-full max-w-md flex-1 flex-col justify-center space-y-4 py-8">
            <div className="rounded-lg border shadow-sm">
                <Card>
                    <CardHeader>
                        <CardTitle className="bg-gradient !bg-cover !bg-clip-text !bg-center pb-1 text-transparent">
                            Profile settings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            <div className="grid gap-1">
                                <Label htmlFor="name">User ID</Label>
                                <Input
                                    id="id"
                                    defaultValue={user.id}
                                    readOnly
                                />
                            </div>
                            <div className="grid gap-1">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    defaultValue={user.username}
                                    readOnly
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="ml-auto">
                            <Link href={siteConfig.paths.auth.passwordReset}>
                                Change Password
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </section>
    );
};

export default ProfilePage;
