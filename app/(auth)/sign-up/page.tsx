import Link from "next/link";
import { Icons } from "@/components/icons";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { SignUpForm } from "./components/sign-up-form";

const SignUpPage = async () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1 className="text-xl font-bold md:text-2xl">Create an account</h1>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        <div className="inline-flex flex-col overflow-hidden w-full space-y-4">
          <Link
            href="/sign-in/google"
            className={cn(buttonVariants({ variant: "outline" }), "flex")}
          >
            <span>
              <Icons.google className="mr-2 h-4 w-4" />
            </span>
            <span>Sign up with Google</span>
          </Link>
          <Link
            href="/sign-in/facebook"
            className={buttonVariants({ variant: "outline" })}
          >
            <span>
              <Icons.facebook className="mr-2 h-4 w-4" />
            </span>
            <span>Sign up with Facebook</span>
          </Link>
          <Link
            href="/sign-in/github"
            className={buttonVariants({ variant: "outline" })}
          >
            <span>
              <Icons.gitHub className="mr-2 h-4 w-4" />
            </span>
            <span>Sign up with GitHub</span>
          </Link>
        </div>

        <div className="flex items-center">
          <Separator className="flex-1" />
          <span className="px-4 text-sm text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>
        <SignUpForm />
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="underline underline-offset-2 hover:text-primary"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignUpPage;
