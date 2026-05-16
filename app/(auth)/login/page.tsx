import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Nimbus with a one-time code — no passwords required.",
  alternates: { canonical: "/login" },
  openGraph: {
    url: "/login",
    title: "Sign in to Nimbus",
    description:
      "Sign in to Nimbus with a one-time code — no passwords required.",
  },
  twitter: {
    title: "Sign in to Nimbus",
    description:
      "Sign in to Nimbus with a one-time code — no passwords required.",
  },
};

export default function LoginPage() {
  return <AuthForm type="login" />;
}
