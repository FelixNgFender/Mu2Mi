'use client';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { httpStatus } from '@/lib/http';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';

export const EmailVerificationForm = () => {
    const { toast } = useToast();
    const form = useForm();
    const onSubmit = async () => {
        const response = await fetch('/api/auth/email-verification', {
            method: 'POST',
        });
        if (
            response.status === httpStatus.clientError.unauthorized ||
            response.status === httpStatus.clientError.unprocessableEntity ||
            response.status === httpStatus.serverError.internalServerError
        ) {
            const responseData = await response.json();
            toast({
                variant: 'destructive',
                title: responseData.message || 'Uh oh! Something went wrong.',
                description: responseData.error || '',
            });
        }
        if (response.status === httpStatus.success.ok) {
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
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Button
                    disabled={form.formState.isSubmitting}
                    className="w-full"
                    type="submit"
                >
                    {form.formState.isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        'Resend verification link'
                    )}
                </Button>
            </form>
        </Form>
    );
};
