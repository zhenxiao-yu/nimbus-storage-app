"use server";

// Import necessary Appwrite modules
import { Account, Avatars, Client, Databases, Storage } from "node-appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { cookies } from "next/headers";

/**
 * Creates an authenticated Appwrite client for session-based users.
 * Ensures that the client is configured with the session token stored in cookies.
 * Throws an error if no session is found.
 *
 * @returns An object providing access to Account and Database services
 */
export const createSessionClient = async () => {
  // Initialize Appwrite client
  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl) // Set the Appwrite endpoint
    .setProject(appwriteConfig.projectId); // Set the Appwrite project ID

  // Retrieve the session cookie
  const session = (await cookies()).get("appwrite-session");

  // Validate the session existence
  if (!session || !session.value) {
    throw new Error("No session"); // Throw an error if session is missing
  }

  // Set the session token in the client
  client.setSession(session.value);

  // Return Appwrite services with the authenticated client
  return {
    get account() {
      return new Account(client); // Access Account service
    },
    get databases() {
      return new Databases(client); // Access Database service
    },
  };
};

/**
 * Creates an Appwrite client with admin privileges.
 * Uses the secret API key to authenticate and provide access to additional services.
 *
 * @returns An object providing access to Account, Database, Storage, and Avatar services
 */
export const createAdminClient = async () => {
  // Initialize Appwrite client
  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl) // Set the Appwrite endpoint
    .setProject(appwriteConfig.projectId) // Set the Appwrite project ID
    .setKey(appwriteConfig.secretKey); // Authenticate using the secret API key

  // Return Appwrite services with admin access
  return {
    get account() {
      return new Account(client); // Access Account service
    },
    get databases() {
      return new Databases(client); // Access Database service
    },
    get storage() {
      return new Storage(client); // Access Storage service
    },
    get avatars() {
      return new Avatars(client); // Access Avatar service
    },
  };
};
