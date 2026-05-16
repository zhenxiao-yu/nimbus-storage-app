"use client";

import Link from "next/link";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Loader2, Mail, User, type LucideIcon } from "lucide-react";
import { Github } from "@/components/icons/brand-icons";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export type FormType = "login" | "register";

export const COPY = {
  login: { title: "Welcome back", subtitle: "Continue with a provider, or sign in with email.", submit: "Send sign-in code", footerPrompt: "New to Nimbus? ", footerHref: "/register", footerCta: "Create account" },
  register: { title: "Create your account", subtitle: "One click with a provider — or just an email.", submit: "Send sign-up code", footerPrompt: "Already have an account? ", footerHref: "/login", footerCta: "Sign in" },
} as const;

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" role="img">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" fill="#34A853" />
      <path d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.74.13-1.45.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.95l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335" />
    </svg>
  );
}

type Provider = "google" | "github";

export function OAuthButtons({
  oauthLoading,
  anyLoading,
  onProvider,
}: {
  oauthLoading: Provider | null;
  anyLoading: boolean;
  onProvider: (p: Provider) => void;
}) {
  const items = [
    { id: "google" as const, label: "Continue with Google", Icon: GoogleIcon },
    { id: "github" as const, label: "Continue with GitHub", Icon: (p: { className?: string }) => <Github {...p} /> },
  ];
  return (
    <div className="grid gap-2">
      {items.map(({ id, label, Icon }) => (
        <Button key={id} type="button" variant="outline" className="h-11" onClick={() => onProvider(id)} disabled={anyLoading} aria-label={label}>
          {oauthLoading === id ? (
            <Loader2 aria-hidden="true" className="mr-2 size-4 animate-spin motion-reduce:animate-none" />
          ) : (
            <Icon aria-hidden="true" className="mr-2 size-4" />
          )}
          {label}
        </Button>
      ))}
    </div>
  );
}

export function OrDivider() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border/60" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">or</span>
      </div>
    </div>
  );
}

export function IconField<TValues extends FieldValues>({
  control, name, label, placeholder, icon: Icon, type, autoComplete,
}: {
  control: Control<TValues>; name: FieldPath<TValues>; label: string;
  placeholder: string; icon: LucideIcon; type?: string; autoComplete?: string;
}) {
  return (
    <FormField control={control} name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <div className="relative">
            <Icon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input type={type} placeholder={placeholder} className="h-11 pl-9" autoComplete={autoComplete} {...field} />
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );
}

export const FIELD_ICONS = { user: User, mail: Mail };

export function SwitchFlowLink({ type }: { type: FormType }) {
  const c = COPY[type];
  return (
    <p className="text-center text-sm text-muted-foreground">
      {c.footerPrompt}
      <Link href={c.footerHref} className="font-medium text-primary hover:underline">
        {c.footerCta}
      </Link>
    </p>
  );
}
