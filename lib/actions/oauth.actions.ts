"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OAuthProvider } from "node-appwrite";

import { createAdminClient } from "@/lib/appwrite";

const callbackPath = "/api/auth/oauth-callback";
const failurePath = "/login?error=oauth";

async function buildOriginPaths() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${proto}://${host}` : process.env.NEXT_PUBLIC_SITE_URL!;
  return {
    success: `${origin}${callbackPath}`,
    failure: `${origin}${failurePath}`,
  };
}

export async function signInWithProvider(provider: "google" | "github") {
  const { account } = await createAdminClient();
  const { success, failure } = await buildOriginPaths();

  const providerMap = {
    google: OAuthProvider.Google,
    github: OAuthProvider.Github,
  } as const;

  const redirectUrl = await account.createOAuth2Token(
    providerMap[provider],
    success,
    failure,
  );

  redirect(redirectUrl);
}
