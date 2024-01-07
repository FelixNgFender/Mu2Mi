import Link from "next/link";
import { FaGithub, FaFacebook, FaGoogle } from "react-icons/fa";

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

import { SignInForm } from "./components/sign-in-form";

const SignInPage = async () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1 className="text-xl font-bold md:text-2xl">Welcome back</h1>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        <div className="inline-flex flex-col overflow-hidden w-full space-y-4">
          <Link
            href="/sign-in/google"
            className={cn(buttonVariants({ variant: "outline" }), "flex")}
          >
            <span>
              <FaGoogle className="mr-2 h-4 w-4" />
            </span>
            <span>Continue with Google</span>
          </Link>
          <Link
            href="/sign-in/facebook"
            className={buttonVariants({ variant: "outline" })}
          >
            <span>
              <FaFacebook className="mr-2 h-4 w-4" />
            </span>
            <span>Continue with Facebook</span>
          </Link>
          <Link
            href="/sign-in/github"
            className={buttonVariants({ variant: "outline" })}
          >
            <span>
              <FaGithub className="mr-2 h-4 w-4" />
            </span>
            <span>Continue with GitHub</span>
          </Link>
        </div>

        <div className="flex items-center">
          <Separator className="flex-1" />
          <span className="px-4 text-sm text-muted-foreground">or</span>
          <Separator className="flex-1" />
        </div>
        <SignInForm />
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          New to Mu2Mi?{" "}
          <Link
            href="/sign-up"
            className="underline underline-offset-2 hover:text-primary"
          >
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default SignInPage;
