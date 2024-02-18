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
import { SubmitHandler, useForm } from 'react-hook-form';

import { requestPasswordReset } from './actions';
import { PasswordResetFormType, passwordResetFormSchema } from './schemas';

export const PasswordResetForm = () => {
    const { toast } = useToast();
    const router = useRouter();
    const form = useForm<PasswordResetFormType>({
        resolver: zodResolver(passwordResetFormSchema),
        defaultValues: {
            email: '',
        },
    });

    type FieldName = keyof PasswordResetFormType;

    const onSubmit: SubmitHandler<PasswordResetFormType> = async (data) => {
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
        if (result.data && result.data.success) {
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
