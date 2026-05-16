// One-off: adds deletedAt + shareToken + shareExpiresAt to the Files
// collection, indexes shareToken, adds Files.folderId (string, indexed),
// and creates the Folders collection with its attributes and indexes.
// Idempotent — safe to re-run.
//
// Run:  node --env-file=.env.local scripts/setup-v2-schema.mjs

import { Client, Databases, ID, Permission, Role } from "node-appwrite";

const {
  NEXT_PUBLIC_APPWRITE_ENDPOINT,
  NEXT_PUBLIC_APPWRITE_PROJECT,
  NEXT_PUBLIC_APPWRITE_DATABASE,
  NEXT_PUBLIC_APPWRITE_FILES_COLLECTION,
  NEXT_PUBLIC_APPWRITE_FOLDERS_COLLECTION,
  NEXT_APPWRITE_KEY,
} = process.env;

const required = {
  NEXT_PUBLIC_APPWRITE_ENDPOINT,
  NEXT_PUBLIC_APPWRITE_PROJECT,
  NEXT_PUBLIC_APPWRITE_DATABASE,
  NEXT_PUBLIC_APPWRITE_FILES_COLLECTION,
  NEXT_APPWRITE_KEY,
};
for (const [k, v] of Object.entries(required)) {
  if (!v) {
    console.error(`Missing env var: ${k}`);
    process.exit(1);
  }
}

const client = new Client()
  .setEndpoint(NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(NEXT_PUBLIC_APPWRITE_PROJECT)
  .setKey(NEXT_APPWRITE_KEY);

const databases = new Databases(client);
const dbId = NEXT_PUBLIC_APPWRITE_DATABASE;
const filesColId = NEXT_PUBLIC_APPWRITE_FILES_COLLECTION;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Generic helpers (work against any collection ID)
// ---------------------------------------------------------------------------

async function listAttrs(colId) {
  const res = await databases.listAttributes(dbId, colId);
  return new Map(res.attributes.map((a) => [a.key, a]));
}

async function ensureDatetime(colId, key, required = false) {
  const attrs = await listAttrs(colId);
  if (attrs.has(key)) {
    console.log(`  ✓ ${key} exists (${attrs.get(key).status})`);
    return;
  }
  console.log(`  → creating datetime ${key}…`);
  await databases.createDatetimeAttribute(dbId, colId, key, required);
}

async function ensureString(colId, key, size, required = false) {
  const attrs = await listAttrs(colId);
  if (attrs.has(key)) {
    console.log(`  ✓ ${key} exists (${attrs.get(key).status})`);
    return;
  }
  console.log(`  → creating string ${key} (size ${size}, required=${required})…`);
  await databases.createStringAttribute(dbId, colId, key, size, required);
}

async function waitAvailable(colId, key, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const attrs = await listAttrs(colId);
    const a = attrs.get(key);
    if (a?.status === "available") return;
    await sleep(1500);
  }
  throw new Error(`Timeout waiting for ${key}`);
}

async function ensureIndex(colId, key, attributes) {
  const res = await databases.listIndexes(dbId, colId);
  if (res.indexes.some((i) => i.key === key)) {
    console.log(`  ✓ index ${key} exists`);
    return;
  }
  console.log(`  → creating index ${key} on [${attributes.join(", ")}]…`);
  await databases.createIndex(dbId, colId, key, "key", attributes);
}

// ---------------------------------------------------------------------------
// Folders collection provisioning
// ---------------------------------------------------------------------------

async function ensureFoldersCollection() {
  // If the env var already points at a collection, use it. Otherwise create
  // a fresh collection and print the ID so the user can add it to .env.local.
  let folderColId = NEXT_PUBLIC_APPWRITE_FOLDERS_COLLECTION;

  if (folderColId) {
    try {
      await databases.listDocuments(dbId, folderColId, []);
      console.log(`  ✓ Folders collection exists (${folderColId})`);
      return folderColId;
    } catch (err) {
      if (err?.code === 404) {
        console.log(
          `  ! NEXT_PUBLIC_APPWRITE_FOLDERS_COLLECTION=${folderColId} is set but the collection wasn't found. Creating a new one…`,
        );
        folderColId = "";
      } else {
        throw err;
      }
    }
  }

  if (!folderColId) {
    console.log(`  → creating Folders collection…`);
    const created = await databases.createCollection(
      dbId,
      ID.unique(),
      "Folders",
      [
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      // documentSecurity = true so per-document ownership permissions apply
      true,
    );
    folderColId = created.$id;
    console.log(`  ✓ Folders collection created: ${folderColId}`);
    console.log(
      `\n  >>> ACTION REQUIRED: add this to .env.local AND your Vercel project env:\n` +
        `      NEXT_PUBLIC_APPWRITE_FOLDERS_COLLECTION=${folderColId}\n`,
    );
  }

  return folderColId;
}

async function provisionFoldersCollection(colId) {
  console.log(`\nFolders collection: ${colId}`);
  console.log("Attributes:");
  await ensureString(colId, "name", 100, true);
  await ensureString(colId, "ownerId", 64, true);
  await ensureString(colId, "accountId", 64, true);
  await ensureString(colId, "parentId", 64, false);
  await ensureDatetime(colId, "deletedAt", false);

  console.log("\nWaiting for ownerId + parentId to be available before indexing…");
  await waitAvailable(colId, "ownerId");
  await waitAvailable(colId, "parentId");

  console.log("\nIndexes:");
  await ensureIndex(colId, "ownerId_idx", ["ownerId"]);
  await ensureIndex(colId, "parentId_idx", ["parentId"]);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`Files collection: ${filesColId}\n`);

  console.log("Files attributes:");
  await ensureDatetime(filesColId, "deletedAt");
  await ensureString(filesColId, "shareToken", 64);
  await ensureDatetime(filesColId, "shareExpiresAt");
  await ensureString(filesColId, "folderId", 64);

  console.log("\nWaiting for shareToken + folderId to be available before indexing…");
  await waitAvailable(filesColId, "shareToken");
  await waitAvailable(filesColId, "folderId");

  console.log("\nFiles indexes:");
  await ensureIndex(filesColId, "shareToken_idx", ["shareToken"]);
  await ensureIndex(filesColId, "folderId_idx", ["folderId"]);

  // Folders collection (new in this pass)
  const folderColId = await ensureFoldersCollection();
  await provisionFoldersCollection(folderColId);

  console.log("\nDone. Trash + share-link + folders features are wired.");
  if (!NEXT_PUBLIC_APPWRITE_FOLDERS_COLLECTION) {
    console.log(
      `\nIMPORTANT: NEXT_PUBLIC_APPWRITE_FOLDERS_COLLECTION was not in your env at script start.\n` +
        `Add this line to .env.local AND your Vercel project env, then redeploy:\n` +
        `  NEXT_PUBLIC_APPWRITE_FOLDERS_COLLECTION=${folderColId}\n`,
    );
  }
}

main().catch((err) => {
  console.error("\nSetup failed:");
  console.error(err?.response ?? err);
  process.exit(1);
});
