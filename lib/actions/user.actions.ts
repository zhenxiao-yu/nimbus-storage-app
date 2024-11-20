"use server";

// Import necessary modules and utilities
import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Query, ID } from "node-appwrite";
import { parseStringify } from "@/lib/utils";
import { cookies } from "next/headers";
import { avatarPlaceholderUrl } from "@/constants";
import { redirect } from "next/navigation";

/**
 * Fetches a user document by email from the database.
 * @param email - The email address to search for.
 * @returns The user document if found, otherwise null.
 */
const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.usersCollectionId,
    [Query.equal("email", [email])], // Query to match email
  );

  return result.total > 0 ? result.documents[0] : null;
};

/**
 * Handles errors by logging and rethrowing them.
 * @param error - The caught error.
 * @param message - Additional context message for debugging.
 */
const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

/**
 * Sends an OTP to the provided email address using Appwrite's Email Token.
 * @param email - The recipient email.
 * @returns The user ID associated with the email token.
 */
export const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken(ID.unique(), email);
    return session.userId;
  } catch (error) {
    handleError(error, "Failed to send email OTP");
  }
};

/**
 * Creates an account in the database and sends an OTP to the user's email.
 * If the user doesn't exist, it creates a new document.
 * @param fullName - Full name of the user.
 * @param email - Email address of the user.
 * @returns The account ID or error message if OTP sending fails.
 */
export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  const existingUser = await getUserByEmail(email);

  const accountId = await sendEmailOTP({ email });
  if (!accountId) throw new Error("Failed to send an OTP");

  if (!existingUser) {
    const { databases } = await createAdminClient();

    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar: avatarPlaceholderUrl, // Default avatar
        accountId,
      },
    );
  }

  return parseStringify({ accountId });
};

/**
 * Verifies an OTP and creates a session for the user.
 * @param accountId - The account ID to verify.
 * @param password - The OTP password.
 * @returns The session ID or an error if verification fails.
 */
export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();

    const session = await account.createSession(accountId, password);

    // Set session cookie
    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "Failed to verify OTP");
  }
};

/**
 * Retrieves the currently authenticated user's data from the database.
 * @returns The user document or null if no user is authenticated.
 */
export const getCurrentUser = async () => {
  try {
    const { databases, account } = await createSessionClient();

    const result = await account.get();

    const user = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.usersCollectionId,
      [Query.equal("accountId", result.$id)], // Query to match account ID
    );

    if (user.total <= 0) return null;

    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log(error);
  }
};

/**
 * Logs out the current user by deleting their session and clearing the session cookie.
 */
export const signOutUser = async () => {
  const { account } = await createSessionClient();

  try {
    await account.deleteSession("current"); // Delete the current session
    (await cookies()).delete("appwrite-session"); // Clear the session cookie
  } catch (error) {
    handleError(error, "Failed to sign out user");
  } finally {
    redirect("/sign-in"); // Redirect to the sign-in page
  }
};

/**
 * Signs in a user by sending an OTP to their email.
 * If the user doesn't exist, returns an error.
 * @param email - The user's email address.
 * @returns The account ID or an error message if the user is not found.
 */
export const signInUser = async ({ email }: { email: string }) => {
  try {
    const existingUser = await getUserByEmail(email);

    // If user exists, send OTP
    if (existingUser) {
      await sendEmailOTP({ email });
      return parseStringify({ accountId: existingUser.accountId });
    }

    // If user not found, return error
    return parseStringify({ accountId: null, error: "User not found" });
  } catch (error) {
    handleError(error, "Failed to sign in user");
  }
};
