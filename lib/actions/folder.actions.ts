"use server";

import { ID, Permission, Query, Role } from "node-appwrite";
import { revalidatePath } from "next/cache";

import { createAdminClient } from "@/lib/appwrite";
import {
  appwriteConfig,
  requireFoldersCollectionId,
} from "@/lib/appwrite/config";
import { parseStringify } from "@/lib/utils";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { handleActionError as handleError } from "@/lib/logger";

/**
 * Creates a new folder owned by the current user. `parentId` is null for
 * top-level folders. Currently the UI only ever passes null (single level
 * of nesting), but the schema supports nesting for future work.
 */
export const createFolder = async ({
  name,
  parentId = null,
  path,
}: CreateFolderProps) => {
  try {
    const foldersCollectionId = requireFoldersCollectionId();
    const { databases } = await createAdminClient();
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not found");

    const trimmed = name.trim();
    if (!trimmed) throw new Error("Folder name is required");

    const doc = await databases.createDocument(
      appwriteConfig.databaseId,
      foldersCollectionId,
      ID.unique(),
      {
        name: trimmed,
        ownerId: currentUser.$id,
        accountId: currentUser.accountId,
        parentId: parentId ?? null,
      },
      [
        Permission.read(Role.user(currentUser.accountId)),
        Permission.update(Role.user(currentUser.accountId)),
        Permission.delete(Role.user(currentUser.accountId)),
      ],
    );

    revalidatePath(path);
    return parseStringify(doc);
  } catch (error) {
    handleError(error, "Failed to create folder");
  }
};

/**
 * Renames a folder. Only the owner can rename — enforced by the per-document
 * permissions written at create time.
 */
export const renameFolder = async ({
  folderId,
  name,
  path,
}: RenameFolderProps) => {
  try {
    const foldersCollectionId = requireFoldersCollectionId();
    const { databases } = await createAdminClient();

    const trimmed = name.trim();
    if (!trimmed) throw new Error("Folder name is required");

    const doc = await databases.updateDocument(
      appwriteConfig.databaseId,
      foldersCollectionId,
      folderId,
      { name: trimmed },
    );

    revalidatePath(path);
    return parseStringify(doc);
  } catch (error) {
    handleError(error, "Failed to rename folder");
  }
};

/**
 * Soft-deletes a folder by setting `deletedAt`. Files inside the folder are
 * left untouched on purpose: the user can still see them in their type-filtered
 * dashboard views and recover the folder later by clearing `deletedAt`. The
 * folder simply disappears from listings.
 */
export const deleteFolder = async ({ folderId, path }: DeleteFolderProps) => {
  try {
    const foldersCollectionId = requireFoldersCollectionId();
    const { databases } = await createAdminClient();

    await databases.updateDocument(
      appwriteConfig.databaseId,
      foldersCollectionId,
      folderId,
      { deletedAt: new Date().toISOString() },
    );

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to delete folder");
  }
};

/**
 * Fetches folders owned by the current user. If `parentId` is provided,
 * scopes to that parent (use `null` for root-level folders). Otherwise
 * returns every active folder.
 */
export const getFolders = async ({ parentId }: GetFoldersProps = {}) => {
  try {
    const foldersCollectionId = requireFoldersCollectionId();
    const { databases } = await createAdminClient();
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not found");

    const queries = [
      Query.equal("ownerId", currentUser.$id),
      Query.isNull("deletedAt"),
      Query.orderDesc("$createdAt"),
    ];

    if (parentId === null) {
      queries.push(Query.isNull("parentId"));
    } else if (typeof parentId === "string") {
      queries.push(Query.equal("parentId", parentId));
    }

    const res = await databases.listDocuments(
      appwriteConfig.databaseId,
      foldersCollectionId,
      queries,
    );

    return parseStringify(res);
  } catch (error) {
    handleError(error, "Failed to get folders");
  }
};

/**
 * Fetches a single folder by ID and verifies the current user owns it.
 * Returns null when the folder doesn't exist, has been soft-deleted, or
 * belongs to another user — callers (like the folder page) use this for
 * a `notFound()` check.
 */
export const getFolderById = async (folderId: string) => {
  try {
    const foldersCollectionId = requireFoldersCollectionId();
    const { databases } = await createAdminClient();
    const currentUser = await getCurrentUser();
    if (!currentUser) return null;

    const doc = await databases.getDocument(
      appwriteConfig.databaseId,
      foldersCollectionId,
      folderId,
    );

    if (!doc) return null;
    if (doc.ownerId !== currentUser.$id) return null;
    if (doc.deletedAt) return null;

    return parseStringify(doc);
  } catch {
    return null;
  }
};
