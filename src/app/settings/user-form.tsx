'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { siteConfig } from '@/config/site';
import type { UserDTO } from '@/models/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { SubmitHandler, useForm } from 'react-hook-form';

import { editProfile } from './actions';
import { UserFormType, userFormSchema } from './schemas';

type UserFormProps = {
    userDTO: UserDTO;
};

export const UserForm = ({ userDTO: user }: UserFormProps) => {
    const { toast } = useToast();
    const form = useForm<UserFormType>({
        resolver: zodResolver(userFormSchema),
        defaultValues: {
            username: user.username,
        },
    });

    type FieldName = keyof UserFormType;

    const onSubmit: SubmitHandler<UserFormType> = async (data) => {
        const { validationErrors, serverError } = await editProfile(data);
        if (validationErrors) {
            for (const [path, value] of Object.entries(validationErrors)) {
                form.setError(path as FieldName, {
                    type: path,
                    message: value.join(', '),
                });
            }
        }
        if (serverError) {
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: serverError,
            });
            form.reset();
        }
        if (!validationErrors && !serverError) {
            toast({
                title: 'Profile updated!',
            });
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 rounded-lg border shadow-sm"
            >
                <Card>
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
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={
                                                form.formState.isSubmitting
                                            }
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button asChild variant="secondary">
                            <Link href={siteConfig.paths.auth.passwordReset}>
                                Change Password
                            </Link>
                        </Button>
                        <Button
                            size={
                                form.formState.isSubmitting ? 'icon' : 'default'
                            }
                            type="submit"
                            disabled={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Save changes'
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    );
};
