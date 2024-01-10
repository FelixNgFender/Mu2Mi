'use client';

import {
    newPasswordSchemaClient,
    newPasswordSchemaClientType,
} from '@/src/app/_schemas/client/new-password';
import {
    passwordResetSchemaClient,
    passwordResetSchemaClientType,
} from '@/src/app/_schemas/client/password-reset';
import { Icons } from '@/src/components/icons';
import { Button } from '@/src/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/src/components/ui/form';
import { Input } from '@/src/components/ui/input';
import { ToastAction } from '@/src/components/ui/toast';
import { useToast } from '@/src/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

export const NewPasswordForm = ({ token }: { token: string }) => {
    // 1. Define your form.
    const { toast } = useToast();
    const router = useRouter();
    const form = useForm<newPasswordSchemaClientType>({
        resolver: zodResolver(newPasswordSchemaClient),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    // 2. Define a submit handler.
    const onSubmit = async (data: newPasswordSchemaClientType) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        const response = await fetch(`/api/password-reset/${token}`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
            redirect: 'manual',
        });
        if (response.status === 400) {
            const responseData = await response.json();
            if (responseData.error) {
                toast({
                    variant: 'destructive',
                    title: 'Uh oh! Something went wrong.',
                    description: responseData.error,
                });
            }
            if (responseData.errors) {
                for (const error of responseData.errors) {
                    for (const path of error.path) {
                        form.setError(path, {
                            type: path,
                            message: error.message,
                        });
                    }
                }
            }
        }
        if (response.status === 500) {
            const responseData = await response.json();
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: responseData.error,
            });
        }
        if (response.status === 0) {
            // redirected
            // when using `redirect: "manual"`, response status 0 is returned
            return router.refresh();
        }
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 md:space-y-6"
            >
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    {...field}
                                    disabled={form.formState.isSubmitting}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirm password</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    {...field}
                                    disabled={form.formState.isSubmitting}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    disabled={form.formState.isSubmitting}
                    className="w-full"
                    type="submit"
                >
                    {form.formState.isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        'Reset password'
                    )}
                </Button>
            </form>
        </Form>
    );
};
