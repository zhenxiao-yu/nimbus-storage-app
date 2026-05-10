import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to Nimbus with a one-time code — no passwords required.",
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return <AuthForm type="login" />;
}
