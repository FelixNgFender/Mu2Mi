'use client';

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
import { PasswordInput } from '@/components/ui/password-input';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { setNewPassword } from './actions';
import { NewPasswordFormType, newPasswordFormSchema } from './schemas';

export const NewPasswordForm = ({ token }: { token: string }) => {
    const { toast } = useToast();
    const form = useForm<NewPasswordFormType>({
        resolver: zodResolver(newPasswordFormSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
            token,
        },
    });

    type FieldName = keyof NewPasswordFormType;

    const onSubmit: SubmitHandler<NewPasswordFormType> = async (
        data: NewPasswordFormType,
    ) => {
        const result = await setNewPassword(data);
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
                {/* hidden form field for token */}
                <FormField
                    control={form.control}
                    name="token"
                    render={({ field }) => (
                        <FormControl>
                            <Input type="hidden" {...field} value={token} />
                        </FormControl>
                    )}
                />
                <Button
                    disabled={form.formState.isSubmitting}
                    className="w-full"
                    type="submit"
                >
                    {form.formState.isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        'Reset password'
                    )}
                </Button>
            </form>
        </Form>
    );
};
