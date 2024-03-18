import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { DialogFooter, DialogHeader } from '@/components/ui/dialog';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { siteConfig } from '@/config/site';
import { umami } from '@/lib/analytics';
import { getUserSession } from '@/models/user';
import { Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { deleteAccount } from './actions';

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
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="destructive">
                                Delete account
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    Confirm account deletion
                                </DialogTitle>
                                <DialogDescription>
                                    This irreversible action will delete your
                                    account and all associated data.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="space-y-2">
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="mt-2"
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Close
                                    </Button>
                                </DialogClose>
                                <form action={deleteAccount}>
                                    <Button
                                        variant="destructive"
                                        data-umami-event={
                                            umami.deleteAccount.name
                                        }
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete account
                                    </Button>
                                </form>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
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
