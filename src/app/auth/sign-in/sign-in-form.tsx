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
import { PasswordInput } from '@/components/ui/password-input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { SubmitHandler, useForm } from 'react-hook-form';

import { signIn } from './actions';
import { SignInFormType, signInFormSchema } from './schemas';

export const SignInForm = () => {
    const form = useForm<SignInFormType>({
        resolver: zodResolver(signInFormSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    });
    const { toast } = useToast();

    type FieldName = keyof SignInFormType;

    const onSubmit: SubmitHandler<SignInFormType> = async (data) => {
        const result = await signIn(data);
        // must check if action returns redirect
        if (!result) return;
        if (result.validationErrors) {
            for (const [path, value] of Object.entries(
                result.validationErrors,
            )) {
                form.setError(path as FieldName, {
                    type: path,
                    message: value.join(', '),
                });
            }
        }
        if (result.serverError) {
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: result.serverError,
            });
            form.reset();
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
                                <PasswordInput
                                    autoComplete="current-password"
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
                        href="/auth/password-reset"
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
                        href="/legal/terms"
                        className="underline underline-offset-2 hover:text-primary"
                    >
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                        href="/legal/privacy"
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
