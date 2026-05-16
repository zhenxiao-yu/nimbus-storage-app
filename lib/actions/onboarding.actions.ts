"use server";

import path from "path";
import { readFile } from "fs/promises";

import { ID, Query } from "node-appwrite";
import { InputFile } from "node-appwrite/file";

import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { constructFileUrl, getFileType } from "@/lib/utils";
import { logError } from "@/lib/logger";

// Source asset under public/onboarding/. Markdown is used because the
// existing PreviewModal text branch renders .md files inline (see
// TEXT_EXTENSIONS in components/PreviewModal.tsx) and it's trivial to
// author + version-control without pulling in a PDF dependency.
const WELCOME_FILE_NAME = "Welcome to Nimbus.md";
const WELCOME_ASSET_PATH = path.join(
  process.cwd(),
  "public",
  "onboarding",
  "welcome.md",
);

/**
 * Seeds a brand-new user's workspace with a single welcome file so the
 * dashboard isn't empty on first visit. Idempotent: if a file owned by
 * `ownerId` with the same display name already exists, this is a no-op.
 *
 * Failures are swallowed and logged — a missing welcome file should never
 * block signup. Callers should treat this as fire-and-forget for UX
 * purposes (still await it so we don't drop the promise on serverless).
 */
export const seedWelcomeFile = async ({
  ownerId,
  accountId,
}: {
  ownerId: string;
  accountId: string;
}): Promise<void> => {
  try {
    const { storage, databases } = await createAdminClient();

    // Idempotency check: skip if this user already has the welcome file.
    const existing = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [
        Query.equal("owner", ownerId),
        Query.equal("name", WELCOME_FILE_NAME),
        Query.limit(1),
      ],
    );
    if (existing.total > 0) return;

    const buffer = await readFile(WELCOME_ASSET_PATH);
    const inputFile = InputFile.fromBuffer(buffer, WELCOME_FILE_NAME);

    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      inputFile,
    );

    const { type, extension } = getFileType(WELCOME_FILE_NAME);

    try {
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        ID.unique(),
        {
          type,
          name: WELCOME_FILE_NAME,
          url: constructFileUrl(bucketFile.$id),
          extension,
          size: bucketFile.sizeOriginal,
          owner: ownerId,
          accountId,
          users: [],
          bucketFileId: bucketFile.$id,
        },
      );
    } catch (error) {
      // Roll back the storage upload if the metadata write fails, matching
      // the pattern in uploadFile().
      await storage
        .deleteFile(appwriteConfig.bucketId, bucketFile.$id)
        .catch(() => undefined);
      throw error;
    }
  } catch (error) {
    logError("seedWelcomeFile failed", error, { ownerId, accountId });
  }
};
