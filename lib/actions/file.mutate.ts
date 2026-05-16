"use server";

import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
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
 * Deletes a file from storage and its corresponding database document.
 * @param fileId - ID of the file in the database.
 * @param bucketFileId - ID of the file in the storage bucket.
 * @param path - Path to revalidate after deletion.
 * @returns Success status.
 */
export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
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
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to delete file");
  }
};
