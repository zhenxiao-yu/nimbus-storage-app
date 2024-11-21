"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/actions/user.actions";

/**
 * Handles errors by logging and rethrowing them.
 * @param error - The caught error object.
 * @param message - A custom error message for debugging context.
 */
const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

/**
 * Uploads a file to Appwrite storage and creates a corresponding database document.
 * @param file - The file to upload.
 * @param ownerId - The ID of the owner uploading the file.
 * @param accountId - The ID of the account performing the operation.
 * @param path - The path to revalidate after the upload.
 * @returns The created file document.
 */
export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  try {
    const { storage, databases } = await createAdminClient();

    console.log("Storage client initialized:", storage);
    console.log("Database client initialized:", databases);

    // Convert the file to InputFile for Appwrite
    const buffer = Buffer.from(await file.arrayBuffer());
    const inputFile = InputFile.fromBuffer(buffer, file.name);
    console.log("InputFile created:", inputFile);

    // Upload file to Appwrite storage bucket
    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      inputFile,
    );
    console.log("File uploaded to storage bucket:", bucketFile);

    // Prepare the file document to store in the database
    const fileDocument = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
    };

    // Store file metadata in the database
    const newFile = await databases
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        ID.unique(),
        fileDocument,
      )
      .catch(async (error: unknown) => {
        console.error("Error creating file document:", error);

        // Rollback: delete the uploaded file if the document creation fails
        await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
        handleError(error, "Failed to create file document");
      });

    // Trigger revalidation for the given path
    await revalidatePath(path);

    console.log("File metadata saved successfully:", newFile);

    // Return the processed file information
    return parseStringify(newFile);
  } catch (error) {
    console.error("Error during file upload:", error);
    handleError(error, "Failed to upload file");
  }
};

/**
 * Creates queries for fetching files based on user, file types, search text, sorting, and limits.
 * @param currentUser - The currently authenticated user.
 * @param types - Array of file types to filter by.
 * @param searchText - Search string for file names.
 * @param sort - Sorting string (e.g., `$createdAt-desc`).
 * @param limit - Maximum number of files to fetch.
 * @returns An array of query objects for Appwrite.
 */
const createQueries = (
  currentUser: Models.Document,
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

    console.log({ files });
    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get files");
  }
};

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
    const deletedFile = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
    );

    if (deletedFile) {
      await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
    }

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to delete file");
  }
};

/**
 * Calculates the total storage space used by the current user.
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
      [Query.equal("owner", [currentUser.$id])],
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
