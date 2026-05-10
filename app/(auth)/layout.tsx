import { redirect } from "next/navigation";
import { CloudCog, Lock, ShieldCheck } from "lucide-react";

import { AuroraBackground } from "@/components/magicui/aurora-background";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { siteConfig } from "@/constants";
import { getCurrentUser } from "@/lib/actions/user.actions";

export const dynamic = "force-dynamic";

const features = [
  {
    Icon: CloudCog,
    title: "Built on Appwrite",
    body: "Open-source backend with serverless functions, fine-grained permissions, and global CDN.",
  },
  {
    Icon: ShieldCheck,
    title: "Passwordless by design",
    body: "Magic link OTP — no passwords to leak, no resets to manage. Sessions are HttpOnly cookies.",
  },
  {
    Icon: Lock,
    title: "Your files, your rules",
    body: "Per-file sharing, role-based access, and revocation in a single click.",
  },
];

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="absolute right-4 top-4 z-30 flex items-center gap-2">
        <ThemeToggle />
      </div>

      <section className="relative hidden overflow-hidden bg-slate-950 text-white lg:block">
        <AuroraBackground />
        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          <Logo href="/" />

          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                Your files,{" "}
                <span className="bg-gradient-to-br from-violet-300 via-indigo-300 to-sky-300 bg-clip-text text-transparent">
                  beautifully organized.
                </span>
              </h2>
              <p className="max-w-md text-base text-white/70">
                A modern cloud workspace built on Appwrite. Free to run, easy
                to deploy, and yours to extend.
              </p>
            </div>

            <ul className="grid gap-4">
              {features.map(({ Icon, title, body }) => (
                <li
                  key={title}
                  className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="size-4 text-white" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-sm text-white/60">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} {siteConfig.author}. Crafted in
            Vancouver.
          </p>
        </div>
      </section>

      <section className="relative flex flex-col items-center justify-center px-6 py-12 lg:px-12">
        <div className="lg:hidden mb-10">
          <Logo href="/" />
        </div>
        {children}
        <p className="mt-10 max-w-sm text-center text-xs text-muted-foreground/80">
          By continuing you agree to the{" "}
          <a className="underline-offset-4 hover:underline" href="/terms">
            terms
          </a>{" "}
          and{" "}
          <a className="underline-offset-4 hover:underline" href="/privacy">
            privacy
          </a>{" "}
          policy.
        </p>
      </section>
    </div>
  );
}
