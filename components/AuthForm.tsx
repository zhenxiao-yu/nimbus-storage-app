"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { createAccount, signInUser } from "@/lib/actions/user.actions";
import { signInWithProvider } from "@/lib/actions/oauth.actions";
import OtpModal from "@/components/OTPModal";
import {
  COPY,
  FIELD_ICONS,
  IconField,
  OAuthButtons,
  OrDivider,
  SwitchFlowLink,
  type FormType,
} from "@/components/AuthForm.fields";

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
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
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
          ? await createAccount({ fullName: values.fullName || "", email: values.email })
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
    } catch (err) {
      // Next.js server-action redirect() throws a NEXT_REDIRECT signal that
      // bubbles to the client — that's the success path, not a failure.
      const digest = (err as { digest?: string } | null)?.digest;
      if (typeof digest === "string" && digest.startsWith("NEXT_REDIRECT")) return;
      toast.error(
        `${provider === "google" ? "Google" : "GitHub"} sign-in is not configured yet.`,
      );
      setOauthLoading(null);
    }
  };

  const anyLoading = isLoading || oauthLoading !== null;
  const copy = COPY[type];

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="h1 text-balance">{copy.title}</h1>
            <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
          </div>

          <OAuthButtons
            oauthLoading={oauthLoading}
            anyLoading={anyLoading}
            onProvider={handleProvider}
          />

          <OrDivider />

          {type === "register" && (
            <IconField
              control={form.control}
              name="fullName"
              label="Full name"
              placeholder="Ada Lovelace"
              icon={FIELD_ICONS.user}
              autoComplete="name"
            />
          )}
          <IconField
            control={form.control}
            name="email"
            label="Email address"
            placeholder="you@example.com"
            icon={FIELD_ICONS.mail}
            type="email"
            autoComplete="email"
          />

          <Button type="submit" className="h-11 w-full text-base font-medium" disabled={anyLoading}>
            {isLoading && (
              <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin motion-reduce:animate-none" />
            )}
            {copy.submit}
          </Button>

          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            By continuing you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Privacy Policy
            </Link>
            .
          </p>

          <SwitchFlowLink type={type} />
        </form>
      </Form>
      {accountId && <OtpModal email={form.getValues("email")} accountId={accountId} />}
    </>
  );
};

export default AuthForm;
