"use server";

import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Models, Query } from "node-appwrite";
import { parseStringify } from "@/lib/utils";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { handleActionError as handleError, logError } from "@/lib/logger";

// Appwrite's listDocuments defaults to 25 rows per page. For our list views
// we want the full set (capped at the SDK's hard ceiling of 100 per request).
// If/when a workspace genuinely exceeds 100 files of one type we'll add
// pagination — for now this hits the realistic ceiling without round-trips.
const DEFAULT_LIST_LIMIT = 100;

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
  folderId?: string | null,
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

  // Folder scoping:
  // - undefined → don't filter (default, returns files across folders + root)
  // - null      → only root-level files (folderId is null or missing)
  // - string    → only files inside that folder
  if (folderId === null) {
    queries.push(Query.isNull("folderId"));
  } else if (typeof folderId === "string") {
    queries.push(Query.equal("folderId", folderId));
  }

  if (types.length > 0) queries.push(Query.equal("type", types));
  if (searchText) queries.push(Query.contains("name", searchText));
  queries.push(Query.limit(limit ?? DEFAULT_LIST_LIMIT));

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
  folderId,
}: GetFilesProps) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) throw new Error("User not found");

    const queries = createQueries(
      currentUser,
      types,
      searchText,
      sort,
      limit,
      folderId,
    );

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
    queries.push(Query.limit(DEFAULT_LIST_LIMIT));

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
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not authenticated.");

    // Use the admin client (we're already filtering by owner = currentUser.$id
    // explicitly). The previous code created a session client and never used
    // it, then fell through to the admin SDK via getCurrentUser — wasted cookie
    // read + Appwrite client init.
    const { databases } = await createAdminClient();

    // Paginate manually: listDocuments caps at 100 rows per call and the
    // previous implementation silently truncated workspaces with more than
    // 25 files (the SDK default), reporting a low "used" total. Project to
    // only the fields we actually consume to cut payload + parse cost.
    const PAGE_SIZE = 100;
    const totals = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024, // 2GB available bucket storage
    };

    let cursor: string | undefined;
    // Hard cap loop iterations to avoid a runaway query if Appwrite ever
    // returns weird paging state. 50 * 100 = 5,000 files — well above the
    // free-tier ceiling.
    for (let i = 0; i < 50; i++) {
      const queries = [
        Query.equal("owner", [currentUser.$id]),
        Query.isNull("deletedAt"),
        Query.select(["$id", "type", "size", "$updatedAt"]),
        Query.limit(PAGE_SIZE),
      ];
      if (cursor) queries.push(Query.cursorAfter(cursor));

      const page = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        queries,
      );

      for (const file of page.documents) {
        const fileType = file.type as FileType;
        totals[fileType].size += file.size;
        totals.used += file.size;
        if (
          !totals[fileType].latestDate ||
          new Date(file.$updatedAt) > new Date(totals[fileType].latestDate)
        ) {
          totals[fileType].latestDate = file.$updatedAt;
        }
      }

      if (page.documents.length < PAGE_SIZE) break;
      cursor = page.documents[page.documents.length - 1].$id;
    }

    return parseStringify(totals);
  } catch (error) {
    handleError(error, "Error calculating total space used");
  }
}
