import { ID, Query } from "node-appwrite";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { avatarPlaceholderUrl } from "@/constants";
import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * OAuth callback. Appwrite redirects here with `userId` and `secret` after
 * a successful provider login. We exchange those for a session cookie and
 * upsert a row in our `users` collection so the dashboard can find the user.
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  const secret = req.nextUrl.searchParams.get("secret");

  if (!userId || !secret) {
    return NextResponse.redirect(new URL("/login?error=oauth_missing", req.url));
  }

  try {
    const { account, databases } = await createAdminClient();

    const session = await account.createSession(userId, secret);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    // Look up the Appwrite Auth user so we can stamp their email + name
    // into our `users` collection on first sign-in.
    const authUser = await account.get();

    const existing = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", authUser.$id)],
    );

    if (existing.total === 0) {
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        ID.unique(),
        {
          fullName: authUser.name || authUser.email.split("@")[0],
          email: authUser.email,
          avatar: avatarPlaceholderUrl,
          accountId: authUser.$id,
        },
      );
    }

    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (error) {
    console.error("OAuth callback failed", error);
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }
}
