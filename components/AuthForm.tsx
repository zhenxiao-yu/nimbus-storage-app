"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Github, Loader2, Mail, User } from "lucide-react";
import { toast } from "sonner";

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
import { createAccount, signInUser } from "@/lib/actions/user.actions";
import { signInWithProvider } from "@/lib/actions/oauth.actions";
import OtpModal from "@/components/OTPModal";

type FormType = "login" | "register";

const authFormSchema = (formType: FormType) =>
  z.object({
    email: z.string().email("Enter a valid email address"),
    fullName:
      formType === "register"
        ? z
            .string()
            .min(2, "Name must be at least 2 characters")
            .max(50, "Name can't exceed 50 characters")
        : z.string().optional(),
  });

const oauthErrorMessages: Record<string, string> = {
  oauth: "Couldn't complete sign-in with that provider. Please try again.",
  oauth_missing: "Provider didn't return a valid session. Please try again.",
  oauth_failed: "Sign-in failed after the provider redirect. Please try again.",
};

const AuthForm = ({ type }: { type: FormType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(
    null,
  );
  const [accountId, setAccountId] = useState<string | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const errorKey = searchParams.get("error");
    if (errorKey && oauthErrorMessages[errorKey]) {
      toast.error(oauthErrorMessages[errorKey]);
    }
  }, [searchParams]);

  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { fullName: "", email: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const user =
        type === "register"
          ? await createAccount({
              fullName: values.fullName || "",
              email: values.email,
            })
          : await signInUser({ email: values.email });

      if (!user.accountId) {
        toast.error(
          type === "login"
            ? "We couldn't find that email. Try registering first."
            : "Couldn't create your account.",
        );
        return;
      }

      setAccountId(user.accountId);
      toast.success(
        type === "register"
          ? "Account created — check your inbox for the OTP."
          : "Welcome back — check your inbox for the OTP.",
      );
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProvider = async (provider: "google" | "github") => {
    setOauthLoading(provider);
    try {
      await signInWithProvider(provider);
    } catch {
      // signInWithProvider redirects on success; an exception here means
      // the redirect URL couldn't be created (provider not configured).
      toast.error(
        `${provider === "google" ? "Google" : "GitHub"} sign-in is not configured yet.`,
      );
      setOauthLoading(null);
    }
  };

  const anyLoading = isLoading || oauthLoading !== null;

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full max-w-sm space-y-6"
        >
          <div className="space-y-2 text-center">
            <h1 className="h1 text-balance">
              {type === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {type === "login"
                ? "Continue with a provider, or sign in with email."
                : "One click with a provider — or just an email."}
            </p>
          </div>

          <div className="grid gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => handleProvider("google")}
              disabled={anyLoading}
            >
              {oauthLoading === "google" ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <GoogleIcon className="mr-2 size-4" />
              )}
              Continue with Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11"
              onClick={() => handleProvider("github")}
              disabled={anyLoading}
            >
              {oauthLoading === "github" ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Github className="mr-2 size-4" />
              )}
              Continue with GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {type === "register" && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Ada Lovelace"
                        className="h-11 pl-9"
                        autoComplete="name"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="h-11 pl-9"
                      autoComplete="email"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="h-11 w-full text-base font-medium"
            disabled={anyLoading}
          >
            {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
            {type === "login" ? "Send sign-in code" : "Send sign-up code"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {type === "login" ? "New to Nimbus? " : "Already have an account? "}
            <Link
              href={type === "login" ? "/register" : "/login"}
              className="font-medium text-primary hover:underline"
            >
              {type === "login" ? "Create account" : "Sign in"}
            </Link>
          </p>
        </form>
      </Form>
      {accountId && (
        <OtpModal email={form.getValues("email")} accountId={accountId} />
      )}
    </>
  );
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      role="img"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.74.13-1.45.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.95l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default AuthForm;
