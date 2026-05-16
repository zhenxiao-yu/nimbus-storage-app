// One-off cleanup: delete a stray Folders collection that was created during
// schema-script testing. Safe — only deletes if the collection has zero
// documents and is not the active NEXT_PUBLIC_APPWRITE_FOLDERS_COLLECTION.
//
// Run:  node --env-file=.env.local scripts/cleanup-duplicate-folder.mjs <collectionId>

import { Client, Databases } from "node-appwrite";

const targetId = process.argv[2];
if (!targetId) {
  console.error("Usage: node ... cleanup-duplicate-folder.mjs <collectionId>");
  process.exit(1);
}

const {
  NEXT_PUBLIC_APPWRITE_ENDPOINT,
  NEXT_PUBLIC_APPWRITE_PROJECT,
  NEXT_PUBLIC_APPWRITE_DATABASE,
  NEXT_PUBLIC_APPWRITE_FOLDERS_COLLECTION,
  NEXT_APPWRITE_KEY,
} = process.env;

if (targetId === NEXT_PUBLIC_APPWRITE_FOLDERS_COLLECTION) {
  console.error("Refusing: that ID is the active Folders collection.");
  process.exit(1);
}

const client = new Client()
  .setEndpoint(NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(NEXT_PUBLIC_APPWRITE_PROJECT)
  .setKey(NEXT_APPWRITE_KEY);

const databases = new Databases(client);
const dbId = NEXT_PUBLIC_APPWRITE_DATABASE;

const docs = await databases.listDocuments(dbId, targetId, []);
if (docs.total > 0) {
  console.error(
    `Refusing: collection ${targetId} has ${docs.total} documents. Move/delete them first.`,
  );
  process.exit(1);
}

await databases.deleteCollection(dbId, targetId);
console.log(`Deleted empty duplicate collection ${targetId}.`);
