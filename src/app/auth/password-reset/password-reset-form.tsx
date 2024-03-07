'use client';

import { Icons } from '@/components/icons';
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
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { siteConfig } from '@/config/site';
import { httpStatus } from '@/lib/http';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { requestPasswordReset } from './actions';
import { PasswordResetFormType, passwordResetFormSchema } from './schemas';

export const PasswordResetForm = () => {
    const { toast } = useToast();
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const router = useRouter();
    const form = useForm<PasswordResetFormType>({
        resolver: zodResolver(passwordResetFormSchema),
        defaultValues: {
            email: '',
        },
    });

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_ENABLE_CAPTCHA !== 'true') {
            setCaptchaToken('just so it is not null');
        }
    }, []);

    type FieldName = keyof PasswordResetFormType;

    const onSubmit: SubmitHandler<PasswordResetFormType> = async (data) => {
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

        const result = await requestPasswordReset(data);
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
        if (result.data) {
            toast({
                title: 'Password reset link sent!',
                description: 'Check your inbox for the link.',
                action: (
                    <ToastAction altText="Open Gmail">
                        <Link
                            // https://growth.design/sniper-link
                            href={`https://mail.google.com/mail/u/${result.data.email}/#search/from%3A%40${siteConfig.url}+in%3Aanywhere+newer_than%3A1d`}
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
                    <CaptchaWidget
                        action="password-reset"
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
