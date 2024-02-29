'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { OTPInput } from '@/components/ui/otp-input';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { siteConfig } from '@/config/site';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { resendCode, verifyCode } from './actions';
import { verifyCodeFormSchema } from './schemas';

export const EmailVerificationForm = () => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [_, setError] = useState<string | undefined>(undefined);
    const [code, setCode] = useState('');

    const handleComplete = async () => {
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
        <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center space-y-8"
        >
            <OTPInput
                value={code}
                // @ts-expect-error - TS is dumb
                onChange={(newValue: string) => setCode(newValue)}
                maxLength={6}
                allowNavigation
                inputMode="numeric"
                onComplete={handleComplete}
                containerClassName="group flex items-center has-[:disabled]:opacity-30"
                disabled={isSubmitting}
                required
            />
            <Button disabled={isSubmitting} className="w-full" type="submit">
                {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    'Verify email'
                )}
            </Button>
        </form>
    );
};

export const ResendVerificationCodeButton = () => {
    const { toast } = useToast();
    const form = useForm();
    const onSubmit = async () => {
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
                <Button
                    disabled={form.formState.isSubmitting}
                    variant="outline"
                    className="w-full"
                    type="submit"
                >
                    {form.formState.isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        'Didn’t receive an email? Resend'
                    )}
                </Button>
            </form>
        </Form>
    );
};
