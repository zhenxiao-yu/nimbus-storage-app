import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create your free Nimbus account in seconds — no credit card, no password.",
  alternates: { canonical: "/register" },
  openGraph: {
    url: "/register",
    title: "Create your Nimbus account",
    description:
      "Create your free Nimbus account in seconds — no credit card, no password.",
  },
  twitter: {
    title: "Create your Nimbus account",
    description:
      "Create your free Nimbus account in seconds — no credit card, no password.",
  },
};

export default function RegisterPage() {
  return <AuthForm type="register" />;
}
