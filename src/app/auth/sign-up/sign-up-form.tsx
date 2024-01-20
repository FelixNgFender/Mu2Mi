'use client';

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
import { useToast } from '@/components/ui/use-toast';
import { httpStatus } from '@/lib/http';
import {
    signUpSchemaClient,
    signUpSchemaClientType,
} from '@/lib/validations/client/sign-up';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

export const SignUpForm = () => {
    // 1. Define your form.
    const { toast } = useToast();
    const router = useRouter();
    const form = useForm<signUpSchemaClientType>({
        resolver: zodResolver(signUpSchemaClient),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    // 2. Define a submit handler.
    const onSubmit = async (data: signUpSchemaClientType) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        // Run on the client.
        const response = await fetch('/api/auth/sign-up', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
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
                <p className="text-sm italic text-muted-foreground">
                    By signing up, you agree to our{' '}
                    <Link
                        href="/terms"
                        className="underline underline-offset-2 hover:text-primary"
                    >
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                        href="/privacy"
                        className="underline underline-offset-2 hover:text-primary"
                    >
                        Privacy Policy
                    </Link>
                    .
                </p>
                <Button
                    disabled={form.formState.isSubmitting}
                    className="w-full"
                    type="submit"
                >
                    {form.formState.isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        'Sign up'
                    )}
                </Button>
            </form>
        </Form>
    );
};
