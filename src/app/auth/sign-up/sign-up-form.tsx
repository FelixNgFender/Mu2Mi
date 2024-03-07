'use client';

import { Button } from '@/components/ui/button';
import { CaptchaWidget } from '@/components/ui/captcha';
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
import { useToast } from '@/components/ui/use-toast';
import { siteConfig } from '@/config/site';
import { httpStatus } from '@/lib/http';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { signUp } from './actions';
import { SignUpFormType, signUpFormSchema } from './schemas';

export const SignUpForm = () => {
    const { toast } = useToast();
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const form = useForm<SignUpFormType>({
        resolver: zodResolver(signUpFormSchema),
        defaultValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_ENABLE_CAPTCHA !== 'true') {
            setCaptchaToken('just so it is not null');
        }
    }, []);

    type FieldName = keyof SignUpFormType;

    const onSubmit: SubmitHandler<SignUpFormType> = async (data) => {
        if (process.env.NEXT_PUBLIC_ENABLE_CAPTCHA === 'true') {
            if (!captchaToken) return;
            const verificationResult = await fetch(
                siteConfig.paths.api.captcha,
                {
                    method: 'POST',
                    body: JSON.stringify({ token: captchaToken }),
                    headers: {
                        'content-type': 'application/json',
                    },
                },
            );

            if (verificationResult.status !== httpStatus.success.ok.code) {
                toast({
                    variant: 'destructive',
                    title: 'Uh oh! Something went wrong.',
                    description:
                        'The captcha failed to verify. Please refresh the page and try again.',
                });
                return;
            }
        }

        const result = await signUp(data);
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
                                    autoComplete="new-password"
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
                                <PasswordInput
                                    autoComplete="new-password"
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
                        href={siteConfig.paths.legal.terms}
                        className="underline underline-offset-2 hover:text-primary"
                    >
                        Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link
                        href={siteConfig.paths.legal.privacy}
                        className="underline underline-offset-2 hover:text-primary"
                    >
                        Privacy Policy
                    </Link>
                    .
                </p>
                <CaptchaWidget
                    action="sign-up"
                    size="invisible"
                    className="!m-0"
                    onScriptLoadError={() => {
                        toast({
                            variant: 'destructive',
                            title: 'Uh oh! Something went wrong.',
                            description:
                                'The captcha failed to load. Please refresh the page and try again.',
                        });
                    }}
                    onError={() => {
                        toast({
                            variant: 'destructive',
                            title: 'Uh oh! Something went wrong.',
                            description:
                                'The captcha failed to load. Please refresh the page and try again.',
                        });
                    }}
                    onSuccess={setCaptchaToken}
                />
                <Button
                    disabled={form.formState.isSubmitting || !captchaToken}
                    className="w-full"
                    type="submit"
                >
                    {form.formState.isSubmitting || !captchaToken ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        'Sign up'
                    )}
                </Button>
            </form>
        </Form>
    );
};
