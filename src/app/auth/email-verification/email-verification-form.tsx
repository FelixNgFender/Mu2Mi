'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { CaptchaWidget } from '@/components/ui/captcha';
import { Form } from '@/components/ui/form';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { siteConfig } from '@/config/site';
import { httpStatus } from '@/lib/http';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { resendCode, verifyCode } from './actions';
import { verifyCodeFormSchema } from './schemas';

export const EmailVerificationForm = () => {
    const { toast } = useToast();
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [_, setError] = useState<string | undefined>(undefined);
    const [code, setCode] = useState('');

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_ENABLE_CAPTCHA !== 'true') {
            setCaptchaToken('just so it is not null');
        }
    }, []);

    const handleComplete = async () => {
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

        setIsSubmitting(true);

        const parsed = verifyCodeFormSchema.safeParse({
            code,
        });

        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message);
            setIsSubmitting(false);
            return;
        }
        if (parsed.success) setError(undefined);

        const result = await verifyCode({ code });
        // must check if action returns redirect
        if (!result) return;
        if (result.validationErrors) {
            for (const [_, value] of Object.entries(result.validationErrors)) {
                setError(value.join(', '));
            }
            setIsSubmitting(false);
        }
        if (result.serverError) {
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: result.serverError,
            });
            setIsSubmitting(false);
            setCode('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        handleComplete();
    };

    return (
        <>
            <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center space-y-8"
            >
                <InputOTP
                    value={code}
                    onChange={(newValue: string) => setCode(newValue)}
                    maxLength={6}
                    inputMode="numeric"
                    onComplete={handleComplete}
                    disabled={isSubmitting}
                    required
                    render={({ slots }) => (
                        <>
                            <InputOTPGroup>
                                {slots.slice(0, 3).map((slot, index) => (
                                    <InputOTPSlot key={index} {...slot} />
                                ))}{' '}
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                {slots.slice(3).map((slot, index) => (
                                    <InputOTPSlot key={index + 3} {...slot} />
                                ))}
                            </InputOTPGroup>
                        </>
                    )}
                />
                <CaptchaWidget
                    id="email-verification"
                    action="email-verification"
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
                    disabled={isSubmitting || !captchaToken}
                    className="w-full"
                    type="submit"
                >
                    {isSubmitting || !captchaToken ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        'Verify email'
                    )}
                </Button>
            </form>
        </>
    );
};

export const ResendVerificationCodeButton = () => {
    const { toast } = useToast();
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const form = useForm();

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_ENABLE_CAPTCHA !== 'true') {
            setCaptchaToken('just so it is not null');
        }
    }, []);

    const onSubmit = async () => {
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

        const result = await resendCode({});
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
                title: 'Email verification link sent!',
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                <CaptchaWidget
                    id="resend-verification-code"
                    action="resend-verification-code"
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
                    variant="outline"
                    className="w-full"
                    type="submit"
                >
                    {form.formState.isSubmitting || !captchaToken ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        'Didn’t receive an email? Resend'
                    )}
                </Button>
            </form>
        </Form>
    );
};
