'use client';

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

export const PasswordResetForm = () => {
    // 1. Define your form.
    const { toast } = useToast();
    const router = useRouter();
    const form = useForm<passwordResetSchemaClientType>({
        resolver: zodResolver(passwordResetSchemaClient),
        defaultValues: {
            email: '',
        },
    });

    // 2. Define a submit handler.
    const onSubmit = async (data: passwordResetSchemaClientType) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        const response = await fetch('/api/password-reset', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
            },
            redirect: 'manual',
        });
        if (response.status === 400) {
            const responseData = await response.json();
            for (const error of responseData.errors) {
                for (const path of error.path) {
                    form.setError(path, {
                        type: path,
                        message: error.message,
                    });
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
        if (response.status === 200) {
            toast({
                title: 'Password reset link sent!',
                description: 'Check your inbox for the link.',
                action: (
                    <ToastAction altText="Open Gmail">
                        <Link
                            href="https://mail.google.com/mail/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Icons.gmail className="h-4 w-4" />
                        </Link>
                    </ToastAction>
                ),
            });
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
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input
                                    type="email"
                                    placeholder="you@email.com"
                                    {...field}
                                    disabled={form.formState.isSubmitting}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="inline-flex w-full flex-col space-y-2 overflow-hidden md:space-y-4">
                    <Button
                        disabled={form.formState.isSubmitting}
                        className="w-full"
                        type="submit"
                    >
                        {form.formState.isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            'Send reset link'
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full"
                        type="button"
                        onClick={() => {
                            router.back();
                        }}
                    >
                        Go back
                    </Button>
                </div>
            </form>
        </Form>
    );
};
