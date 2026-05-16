import { ID, Query } from "node-appwrite";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { getAvatarUrl } from "@/constants";
import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { logError } from "@/lib/logger";
import { seedWelcomeFile } from "@/lib/actions/onboarding.actions";

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
    const { account, databases, users } = await createAdminClient();

    const session = await account.createSession(userId, secret);

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      // "lax", not "strict": this cookie is set in the response to a
      // redirect chain that started on Google/GitHub. Strict drops the
      // cookie on the subsequent same-site redirect to /dashboard
      // because the navigation chain was cross-site-initiated, leaving
      // the user stuck on /login.
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // Look up the Appwrite Auth user via the server-side Users admin
    // service. We can't use account.get() here because the admin client
    // is API-key authenticated — it has no session context, so .get()
    // would resolve the API key's identity (or throw).
    const authUser = await users.get(userId);

    // Try to find a user doc that's already linked to this Appwrite Auth account.
    const linked = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", authUser.$id)],
    );

    if (linked.total === 0) {
      // No row yet for this accountId. Check if a row exists for the same
      // email — that means this person previously signed up via email-OTP.
      // We migrate that row to point at the new accountId so they keep
      // ownership of all their existing files.
      const byEmail = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.usersCollectionId,
        [Query.equal("email", authUser.email)],
      );

      if (byEmail.total > 0) {
        const doc = byEmail.documents[0];
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.usersCollectionId,
          doc.$id,
          {
            accountId: authUser.$id,
            fullName: doc.fullName || authUser.name || authUser.email.split("@")[0],
          },
        );
      } else {
        const newUserDoc = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.usersCollectionId,
          ID.unique(),
          {
            fullName: authUser.name || authUser.email.split("@")[0],
            email: authUser.email,
            avatar: getAvatarUrl(authUser.name || authUser.email),
            accountId: authUser.$id,
          },
        );

        // First-time OAuth signup: seed the welcome file. Errors are
        // swallowed inside seedWelcomeFile so a seeding failure can't
        // strand the user on /login.
        await seedWelcomeFile({
          ownerId: newUserDoc.$id,
          accountId: authUser.$id,
        });
      }
    }

    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (error) {
    logError("OAuth callback failed", error);
    // We may have set a session cookie before failing on the document
    // upsert. Clear it so the user can retry instead of being trapped in
    // a half-authenticated state where /dashboard redirects them back.
    (await cookies()).delete("appwrite-session");
    return NextResponse.redirect(new URL("/login?error=oauth_failed", req.url));
  }
}
