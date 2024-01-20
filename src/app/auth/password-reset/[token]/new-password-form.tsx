'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { httpStatus } from '@/lib/http';
import {
    newPasswordSchemaClient,
    newPasswordSchemaClientType,
} from '@/lib/validations/client/new-password';
import {
    passwordResetSchemaClient,
    passwordResetSchemaClientType,
} from '@/lib/validations/client/password-reset';
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
        const response = await fetch(`/api/auth/password-reset/${token}`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
            redirect: 'manual',
        });
        if (response.status === httpStatus.clientError.badRequest) {
            const responseData = await response.json();
            const errors = JSON.parse(responseData.error);
            for (const error of errors) {
                for (const path of error.path) {
                    form.setError(path, {
                        type: path,
                        message: error.message,
                    });
                }
            }
        }
        if (response.status === httpStatus.serverError.internalServerError) {
            const responseData = await response.json();
            toast({
                variant: 'destructive',
                title: responseData.message || 'Uh oh! Something went wrong.',
                description: responseData.error || '',
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
