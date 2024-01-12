'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import {
    signInSchemaClient,
    signInSchemaClientType,
} from '@/schemas/client/sign-in';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

export const SignInForm = () => {
    // 1. Define your form.
    const { toast } = useToast();
    const router = useRouter();
    const form = useForm<signInSchemaClientType>({
        resolver: zodResolver(signInSchemaClient),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    });

    // 2. Define a submit handler.
    const onSubmit = async (data: signInSchemaClientType) => {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        const response = await fetch('/api/sign-in', {
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
        if (response.status === 500 || response.status === 429) {
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
                <div className="flex items-center justify-between">
                    <FormField
                        control={form.control}
                        name="rememberMe"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        disabled={form.formState.isSubmitting}
                                    />
                                </FormControl>
                                <FormLabel className="text-sm text-muted-foreground">
                                    Remember me
                                </FormLabel>
                            </FormItem>
                        )}
                    />
                    <Link
                        href="/password-reset"
                        className="text-sm text-muted-foreground underline underline-offset-2 hover:text-primary"
                    >
                        Forgot password?
                    </Link>
                </div>
                <Button
                    disabled={form.formState.isSubmitting}
                    className="w-full"
                    type="submit"
                >
                    {form.formState.isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        'Sign in'
                    )}
                </Button>
                <p className="text-sm italic text-muted-foreground">
                    By signing in, you agree to our{' '}
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
                <Separator />
            </form>
        </Form>
    );
};
