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
            <Card className="space-y-8 rounded-lg border shadow-sm">
                <CardHeader>
                    <CardTitle className="bg-gradient !bg-cover !bg-clip-text !bg-center pb-1 text-transparent">
                        Profile settings
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col space-y-2">
                        <Label htmlFor="id">User ID</Label>
                        <Input id="id" defaultValue={user.id} readOnly />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button asChild variant="secondary">
                        <Link href={siteConfig.paths.auth.passwordReset}>
                            Change Password
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </section>
    );
};

export default ProfilePage;
