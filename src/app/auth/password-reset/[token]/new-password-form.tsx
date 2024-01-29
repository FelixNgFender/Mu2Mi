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
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { setNewPassword } from './actions';

export const NewPasswordForm = ({ token }: { token: string }) => {
    const { toast } = useToast();
    const router = useRouter();
    const form = useForm<NewPasswordSchemaClientType>({
        resolver: zodResolver(newPasswordSchemaClient),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: NewPasswordSchemaClientType) => {
        const result = await setNewPassword(data, token);
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
                toast({
                    variant: 'destructive',
                    title: 'Uh oh! Something went wrong.',
                    description: result.error,
                });
            }
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
                                <Input
                                    type="password"
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
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    {...field}
                                    disabled={form.formState.isSubmitting}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    disabled={form.formState.isSubmitting}
                    className="w-full"
                    type="submit"
                >
                    {form.formState.isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        'Reset password'
                    )}
                </Button>
            </form>
        </Form>
    );
};

/**
 * For **client-side** validation
 */
const newPasswordSchemaClient = z
    .object({
        password: z
            .string()
            .min(8, {
                message: 'Password must be at least 8 characters long',
            })
            .max(64, {
                message: 'Password must be at most 64 characters long',
            }),
        confirmPassword: z
            .string()
            .min(8, {
                message: 'Password must be at least 8 characters long',
            })
            .max(64, {
                message: 'Password must be at most 64 characters long',
            }),
    })
    .refine(({ password, confirmPassword }) => password === confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })
    .superRefine(({ password }, ctx) => {
        const containsUppercase = (ch: string) => /[A-Z]/.test(ch);
        const containsLowercase = (ch: string) => /[a-z]/.test(ch);
        const containsSpecialChar = (ch: string) =>
            /[`!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?~ ]/.test(ch);
        let countOfUpperCase = 0,
            countOfLowerCase = 0,
            countOfNumbers = 0,
            countOfSpecialChar = 0;

        for (let i = 0; i < password.length; i++) {
            let ch = password.charAt(i);
            if (!isNaN(+ch)) countOfNumbers++;
            else if (containsUppercase(ch)) countOfUpperCase++;
            else if (containsLowercase(ch)) countOfLowerCase++;
            else if (containsSpecialChar(ch)) countOfSpecialChar++;
        }

        let errObj = {
            upperCase: {
                pass: true,
                message:
                    'Password must contain at least one uppercase character.',
            },
            lowerCase: {
                pass: true,
                message:
                    'Password must contain at least one lowercase character.',
            },
            specialCh: {
                pass: true,
                message:
                    'Password must contain at least one special character.',
            },
            totalNumber: {
                pass: true,
                message:
                    'Password must contain at least one numeric character.',
            },
        };

        if (countOfLowerCase < 1) {
            errObj = {
                ...errObj,
                lowerCase: { ...errObj.lowerCase, pass: false },
            };
        }
        if (countOfNumbers < 1) {
            errObj = {
                ...errObj,
                totalNumber: { ...errObj.totalNumber, pass: false },
            };
        }
        if (countOfUpperCase < 1) {
            errObj = {
                ...errObj,
                upperCase: { ...errObj.upperCase, pass: false },
            };
        }
        if (countOfSpecialChar < 1) {
            errObj = {
                ...errObj,
                specialCh: { ...errObj.specialCh, pass: false },
            };
        }

        if (
            countOfLowerCase < 1 ||
            countOfUpperCase < 1 ||
            countOfSpecialChar < 1 ||
            countOfNumbers < 1
        ) {
            for (let key in errObj) {
                if (!errObj[key as keyof typeof errObj].pass) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: ['password'],
                        message: errObj[key as keyof typeof errObj].message,
                    });
                }
            }
        }
    });

type NewPasswordSchemaClientType = z.infer<typeof newPasswordSchemaClient>;
