"use client";

import Link from "next/link";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Mail, User } from "lucide-react";
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

const AuthForm = ({ type }: { type: FormType }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [accountId, setAccountId] = useState<string | null>(null);

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
                ? "Sign in with email — we'll send you a one-time code."
                : "Just an email is enough. No passwords, ever."}
            </p>
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
            disabled={isLoading}
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

export default AuthForm;
