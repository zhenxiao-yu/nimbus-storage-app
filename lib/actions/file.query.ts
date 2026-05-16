"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Models, Query } from "node-appwrite";
import { parseStringify } from "@/lib/utils";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { handleActionError as handleError, logError } from "@/lib/logger";

/**
 * Creates queries for fetching files based on user, file types, search text, sorting, and limits.
 * Active files only — trashed files (where `deletedAt` is non-null) are filtered out.
 * @param currentUser - The currently authenticated user.
 * @param types - Array of file types to filter by.
 * @param searchText - Search string for file names.
 * @param sort - Sorting string (e.g., `$createdAt-desc`).
 * @param limit - Maximum number of files to fetch.
 * @returns An array of query objects for Appwrite.
 */
const createQueries = (
  currentUser: Models.DefaultDocument,
  types: string[],
  searchText: string,
  sort: string,
  limit?: number,
) => {
  const queries = [
    Query.or([
      Query.equal("owner", [currentUser.$id]),
      Query.contains("users", [currentUser.email]),
    ]),
    // Exclude trashed files. `isNull` matches both explicit nulls and
    // attribute-missing rows, so legacy documents from before the schema
    // change continue to appear.
    Query.isNull("deletedAt"),
  ];

  if (types.length > 0) queries.push(Query.equal("type", types));
  if (searchText) queries.push(Query.contains("name", searchText));
  if (limit) queries.push(Query.limit(limit));

  if (sort) {
    const [sortBy, orderBy] = sort.split("-");
    queries.push(
      orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy),
    );
  }

  return queries;
};

/**
 * Fetches files from Appwrite based on various filters and sorting options.
 * @param types - File types to filter by.
 * @param searchText - Search string for file names.
 * @param sort - Sorting order for the results.
 * @param limit - Maximum number of files to fetch.
 * @returns The fetched files.
 */
export const getFiles = async ({
  types = [],
  searchText = "",
  sort = "$createdAt-desc",
  limit,
}: GetFilesProps) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) throw new Error("User not found");

    const queries = createQueries(currentUser, types, searchText, sort, limit);

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      queries,
    );

    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get files");
  }
};

/**
 * Fetches trashed files (where `deletedAt` is non-null) owned by the
 * current user. Sharing recipients do not see other users' trash —
 * recovery is the owner's prerogative.
 */
export const getTrashedFiles = async ({
  searchText = "",
  sort = "deletedAt-desc",
}: GetTrashedFilesProps = {}) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) throw new Error("User not found");

    const queries = [
      Query.equal("owner", [currentUser.$id]),
      Query.isNotNull("deletedAt"),
    ];

    if (searchText) queries.push(Query.contains("name", searchText));

    if (sort) {
      const [sortBy, orderBy] = sort.split("-");
      queries.push(
        orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy),
      );
    }

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      queries,
    );

    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get trashed files");
  }
};

/**
 * Looks up a file by its public share token. Returns null when the token
 * doesn't exist, has expired, or the file has been trashed. Public route —
 * uses the admin client and intentionally returns null instead of throwing
 * to keep the share page response cacheable as a simple 404.
 */
export const getFileByShareToken = async (token: string) => {
  if (!token) return null;

  try {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [
        Query.equal("shareToken", token),
        Query.greaterThan("shareExpiresAt", new Date().toISOString()),
        Query.isNull("deletedAt"),
        Query.limit(1),
      ],
    );

    if (result.total === 0) return null;
    return parseStringify(result.documents[0]);
  } catch (error) {
    logError("getFileByShareToken", error);
    return null;
  }
};

/**
 * Calculates the total storage space used by the current user. Trashed
 * files don't count against the active total even though their bytes
 * remain in the bucket — the user-facing "used" number reflects what
 * they consider live storage.
 * @returns The total space used, categorized by file type, and available space.
 */
export async function getTotalSpaceUsed() {
  try {
    const { databases } = await createSessionClient();
    const currentUser = await getCurrentUser();

    if (!currentUser) throw new Error("User is not authenticated.");

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [
        Query.equal("owner", [currentUser.$id]),
        Query.isNull("deletedAt"),
      ],
    );

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024, // 2GB available bucket storage
    };

    files.documents.forEach((file) => {
      const fileType = file.type as FileType;
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      if (
        !totalSpace[fileType].latestDate ||
        new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
      ) {
        totalSpace[fileType].latestDate = file.$updatedAt;
      }
    });

    return parseStringify(totalSpace);
  } catch (error) {
    handleError(error, "Error calculating total space used");
  }
}
