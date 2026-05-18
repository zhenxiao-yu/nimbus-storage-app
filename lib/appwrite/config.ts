import { requireEnv, requirePublicEnv } from "@/lib/env";

/**
 * Central Appwrite identifier registry.
 *
 * Properties are exposed as lazy getters so validation fires at request
 * time (when the server action / route actually runs), not at module load.
 * A missing var throws a clear `Missing required environment variable: X`
 * message instead of letting an `undefined` slip through to the Appwrite
 * SDK and surface as an opaque 400/500. Lazy evaluation also means
 * `next build` won't crash on missing runtime-only secrets during static
 * analysis of dynamic routes.
 *
 * The folders collection is intentionally optional and gated by
 * `requireFoldersCollectionId()` so the v2 schema script can provision it
 * before the env is updated.
 */
export const appwriteConfig = {
  get endpointUrl() {
    return requirePublicEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT");
  },
  get projectId() {
    return requirePublicEnv("NEXT_PUBLIC_APPWRITE_PROJECT");
  },
  get databaseId() {
    return requirePublicEnv("NEXT_PUBLIC_APPWRITE_DATABASE");
  },
  get usersCollectionId() {
    return requirePublicEnv("NEXT_PUBLIC_APPWRITE_USERS_COLLECTION");
  },
  get filesCollectionId() {
    return requirePublicEnv("NEXT_PUBLIC_APPWRITE_FILES_COLLECTION");
  },
  // Optional at boot; gated by `requireFoldersCollectionId()` instead so the
  // v2 schema script can provision it before the env is updated.
  get foldersCollectionId() {
    return process.env.NEXT_PUBLIC_APPWRITE_FOLDERS_COLLECTION ?? "";
  },
  get bucketId() {
    return requirePublicEnv("NEXT_PUBLIC_APPWRITE_BUCKET");
  },
  get secretKey() {
    return requireEnv("NEXT_APPWRITE_KEY");
  },
};

/**
 * Resolves the folders collection ID at runtime and throws a descriptive
 * error if the env var is missing. Folder-related server actions call this
 * so a missing env produces a clean message instead of a 500 from Appwrite.
 */
export function requireFoldersCollectionId(): string {
  if (!appwriteConfig.foldersCollectionId) {
    throw new Error(
      "NEXT_PUBLIC_APPWRITE_FOLDERS_COLLECTION is not set. Add it to .env.local " +
        "(and your Vercel project env). Run `node --env-file=.env.local scripts/setup-v2-schema.mjs` " +
        "to provision the folders collection and print its ID.",
    );
  }
  return appwriteConfig.foldersCollectionId;
}
