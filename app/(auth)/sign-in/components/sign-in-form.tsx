"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";

const signInSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address." }),
    password: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters long",
      })
      .max(64, {
        message: "Password must be at most 64 characters long",
      }),
    confirmPassword: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters long",
      })
      .max(64, {
        message: "Password must be at most 64 characters long",
      }),
    remember: z.boolean(),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const SignInForm = () => {
  // TODO: <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
  // 1. Define your form.
  const router = useRouter();
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      remember: true,
    },
  });

  // 2. Define a submit handler.
  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(data);
    const response = await fetch("/api/sign-up", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "manual",
    });
    if (response.status === 0) {
      // redirected
      // when using `redirect: "manual"`, response status 0 is returned
      return router.refresh();
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
                <Input type="email" placeholder="you@email.com" {...field} />
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
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm text-muted-foreground">
                  Remember me
                </FormLabel>
              </FormItem>
            )}
          />
          <Link
            href="/password-reset"
            className="text-sm text-muted-foreground underline underline-offset-2 hover:text-primary"
          >
            Forgot password?
          </Link>
        </div>
        <Button className="w-full" type="submit">
          Sign in
        </Button>
        <p className="text-sm text-muted-foreground italic">
          By signing in, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-2 hover:text-primary"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-2 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <Separator />
      </form>
    </Form>
  );
};
