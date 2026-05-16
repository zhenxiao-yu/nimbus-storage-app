// One-off: adds deletedAt + shareToken + shareExpiresAt to the Files collection
// and indexes shareToken. Idempotent — safe to re-run.
//
// Run:  node --env-file=.env.local scripts/setup-v2-schema.mjs

import { Client, Databases } from "node-appwrite";

const {
  NEXT_PUBLIC_APPWRITE_ENDPOINT,
  NEXT_PUBLIC_APPWRITE_PROJECT,
  NEXT_PUBLIC_APPWRITE_DATABASE,
  NEXT_PUBLIC_APPWRITE_FILES_COLLECTION,
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
const colId = NEXT_PUBLIC_APPWRITE_FILES_COLLECTION;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function listAttrs() {
  const res = await databases.listAttributes(dbId, colId);
  return new Map(res.attributes.map((a) => [a.key, a]));
}

async function ensureDatetime(key) {
  const attrs = await listAttrs();
  if (attrs.has(key)) {
    console.log(`  ✓ ${key} exists (${attrs.get(key).status})`);
    return;
  }
  console.log(`  → creating datetime ${key}…`);
  await databases.createDatetimeAttribute(dbId, colId, key, false);
}

async function ensureString(key, size) {
  const attrs = await listAttrs();
  if (attrs.has(key)) {
    console.log(`  ✓ ${key} exists (${attrs.get(key).status})`);
    return;
  }
  console.log(`  → creating string ${key} (size ${size})…`);
  await databases.createStringAttribute(dbId, colId, key, size, false);
}

async function waitAvailable(key, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const attrs = await listAttrs();
    const a = attrs.get(key);
    if (a?.status === "available") return;
    await sleep(1500);
  }
  throw new Error(`Timeout waiting for ${key}`);
}

async function ensureIndex(key, attributes) {
  const res = await databases.listIndexes(dbId, colId);
  if (res.indexes.some((i) => i.key === key)) {
    console.log(`  ✓ index ${key} exists`);
    return;
  }
  console.log(`  → creating index ${key} on [${attributes.join(", ")}]…`);
  await databases.createIndex(dbId, colId, key, "key", attributes);
}

async function main() {
  console.log(`Files collection: ${colId}\n`);

  console.log("Attributes:");
  await ensureDatetime("deletedAt");
  await ensureString("shareToken", 64);
  await ensureDatetime("shareExpiresAt");

  console.log("\nWaiting for shareToken to be available before indexing…");
  await waitAvailable("shareToken");

  console.log("\nIndexes:");
  await ensureIndex("shareToken_idx", ["shareToken"]);

  console.log("\nDone. Trash + share-link features are now wired.");
}

main().catch((err) => {
  console.error("\nSetup failed:");
  console.error(err?.response ?? err);
  process.exit(1);
});
