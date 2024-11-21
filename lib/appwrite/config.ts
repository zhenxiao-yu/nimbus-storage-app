export const appwriteConfig = {
  // The base URL for the Appwrite server, used for making API requests.
  // This is typically set in the environment file (.env).
  endpointUrl: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,

  // The unique ID of the Appwrite project, identifying the project on the Appwrite server.
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT!,

  // The unique ID of the database within the Appwrite project where data is stored.
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE!,

  // The collection ID for storing and managing user-related data.
  usersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION!,

  // The collection ID for managing files' metadata in the database.
  filesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_FILES_COLLECTION!,

  // The bucket ID used for storing files in Appwrite's storage service.
  bucketId: process.env.NEXT_PUBLIC_APPWRITE_BUCKET!,

  // The secret key for secure access to the Appwrite API.
  // Ensure this is protected and not exposed to the client-side.
  secretKey: process.env.NEXT_APPWRITE_KEY!,
};
