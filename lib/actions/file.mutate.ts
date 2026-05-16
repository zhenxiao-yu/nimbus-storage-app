"use server";

import { randomBytes } from "crypto";

import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { siteConfig } from "@/constants";
import { parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { handleActionError as handleError } from "@/lib/logger";

/**
 * Renames a file in the database.
 * @param fileId - ID of the file to rename.
 * @param name - New name for the file (without extension).
 * @param extension - File extension.
 * @param path - Path to revalidate after the update.
 * @returns The updated file document.
 */
export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {
  const { databases } = await createAdminClient();

  try {
    const newName = `${name}.${extension}`;
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        name: newName,
      },
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

/**
 * Updates the list of users with access to a file.
 * @param fileId - ID of the file.
 * @param emails - Array of user emails to update.
 * @param path - Path to revalidate after the update.
 * @returns The updated file document.
 */
export const updateFileUsers = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  const { databases } = await createAdminClient();

  try {
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        users: emails,
      },
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to update file users");
  }
};

/**
 * Soft-deletes a file by setting `deletedAt` to the current time. The bucket
 * blob stays in storage so a subsequent restore is fast and lossless. Use
 * `permanentlyDeleteFile` to actually free the bytes.
 * @param fileId - ID of the file in the database.
 * @param path - Path to revalidate after deletion.
 * @returns Success status.
 */
export const deleteFile = async ({ fileId, path }: DeleteFileProps) => {
  const { databases } = await createAdminClient();

  try {
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        deletedAt: new Date().toISOString(),
      },
    );

    revalidatePath(path);
    revalidatePath("/dashboard/trash");
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to delete file");
  }
};

/**
 * Restores a previously soft-deleted file by clearing its `deletedAt` field.
 * Used both by the trash page and by the "Undo" toast that fires right after
 * a delete action.
 */
export const restoreFile = async ({ fileId, path }: RestoreFileProps) => {
  const { databases } = await createAdminClient();

  try {
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        deletedAt: null,
      },
    );

    revalidatePath(path);
    revalidatePath("/dashboard/trash");
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to restore file");
  }
};

/**
 * Permanently deletes a file: removes the bucket blob, then deletes the
 * metadata document. Only invoked from the trash page.
 */
export const permanentlyDeleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: PermanentlyDeleteFileProps) => {
  const { databases, storage } = await createAdminClient();

  try {
    // Delete the bucket blob first. If this fails we keep the document so
    // the file remains visible and the user can retry. Doing it the other
    // way around can leave orphaned blobs silently consuming quota.
    await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);

    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
    );

    revalidatePath(path);
    revalidatePath("/dashboard/trash");
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to permanently delete file");
  }
};

/**
 * Generates a URL-safe random token of `length` characters using
 * crypto.randomBytes. base64url avoids `+/=` which would need escaping
 * in URLs and confuse copy/paste.
 */
const generateShareToken = (length = 32): string => {
  return randomBytes(length)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")
    .slice(0, length);
};

/**
 * Creates (or refreshes) a public share link for a file. Anyone with the
 * resulting URL can view + download until `shareExpiresAt`. Calling this
 * again rotates the token.
 */
export const createShareLink = async ({
  fileId,
  daysValid,
  path,
}: CreateShareLinkProps) => {
  const { databases } = await createAdminClient();

  try {
    const token = generateShareToken(32);
    const expires = new Date();
    expires.setDate(expires.getDate() + daysValid);

    const updated = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        shareToken: token,
        shareExpiresAt: expires.toISOString(),
      },
    );

    revalidatePath(path);

    return parseStringify({
      status: "success",
      url: `${siteConfig.url}/share/${token}`,
      token,
      expiresAt: expires.toISOString(),
      file: updated,
    });
  } catch (error) {
    handleError(error, "Failed to create share link");
  }
};

/**
 * Moves a file into a folder (or back to the root when `folderId` is null).
 * Just updates the `folderId` field on the file document — bucket blobs are
 * untouched.
 */
export const moveFile = async ({ fileId, folderId, path }: MoveFileProps) => {
  const { databases } = await createAdminClient();

  try {
    const updated = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { folderId: folderId ?? null },
    );

    revalidatePath(path);
    return parseStringify(updated);
  } catch (error) {
    handleError(error, "Failed to move file");
  }
};

/**
 * Revokes an existing share link by clearing both fields.
 */
export const revokeShareLink = async ({
  fileId,
  path,
}: RevokeShareLinkProps) => {
  const { databases } = await createAdminClient();

  try {
    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        shareToken: null,
        shareExpiresAt: null,
      },
    );

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to revoke share link");
  }
};
