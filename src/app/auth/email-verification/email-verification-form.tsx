'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { OTPInput } from '@/components/ui/otp-input';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { resendCode, verifyCode } from './actions';

const emailVerificationSchemaClient = z.object({
    code: z
        .string()
        .min(6, {
            message: 'Code must be 6 characters long',
        })
        .max(6, {
            message: 'Code must be 6 characters long',
        })
        .regex(/^[0-9]+$/, {
            message: 'Code must contain only numbers',
        }),
});

export const EmailVerificationForm = () => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | undefined>(undefined);
    const [code, setCode] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const parsed = emailVerificationSchemaClient.safeParse({
            code,
        });
        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message);
            setIsSubmitting(false);
            return;
        }
        if (parsed.success) setError(undefined);

        const result = await verifyCode(code);
        if (result && !result.success) {
            setError(result.error);
            setIsSubmitting(false);
            return;
        }
    };

    useEffect(() => {
        if (error) {
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: error,
            });
        }
    }, [error, toast]);

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center space-y-4"
        >
            <OTPInput
                value={code}
                onOtpChange={(otp) => setCode(otp)}
                placeholder=""
                autoFocus={false}
                className="px-auto w-10"
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
        const result = await resendCode();
        if (!result.success) {
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: result.error,
            });
        }
        toast({
            title: 'Email verification link sent!',
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
