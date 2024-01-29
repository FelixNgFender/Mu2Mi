'use client';

import { Icons } from '@/components/icons';
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
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { requestPasswordReset } from './actions';

export const PasswordResetForm = () => {
    const { toast } = useToast();
    const router = useRouter();
    const form = useForm<PasswordResetSchemaClientType>({
        resolver: zodResolver(passwordResetSchemaClient),
        defaultValues: {
            email: '',
        },
    });

    const onSubmit = async (data: PasswordResetSchemaClientType) => {
        const result = await requestPasswordReset(data);
        if (!result) return;
        if (!result.success) {
            try {
                const errors = JSON.parse(result.error);
                for (const error of errors) {
                    for (const path of error.path) {
                        form.setError(path, {
                            type: path,
                            message: error.message,
                        });
                    }
                }
            } catch (e) {
                form.setError('email', {
                    type: 'email',
                    message: result.error,
                });
            }
        }
        if (result.success) {
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

/**
 * For **client-side** validation
 */
const passwordResetSchemaClient = z.object({
    email: z.string().email({ message: 'Invalid email address.' }),
});

type PasswordResetSchemaClientType = z.infer<typeof passwordResetSchemaClient>;
