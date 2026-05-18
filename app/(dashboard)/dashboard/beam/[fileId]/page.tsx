import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BeamSender from "@/components/BeamSender";
import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { constructFileUrl, parseStringify } from "@/lib/utils";

interface BeamPageProps {
  params: Promise<{ fileId: string }>;
}

export const metadata: Metadata = {
  title: "Beam file",
  description: "Send a file peer-to-peer with a one-time 4-digit code.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function BeamSenderPage({ params }: BeamPageProps) {
  const { fileId } = await params;

  const currentUser = await getCurrentUser();
  if (!currentUser) notFound();

  let doc: Record<string, unknown> | null = null;
  try {
    const { databases } = await createAdminClient();
    doc = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
    );
  } catch {
    notFound();
  }

  if (!doc) notFound();
  const file = parseStringify(doc) as {
    $id: string;
    name: string;
    size: number;
    extension?: string;
    mimeType?: string;
    bucketFileId: string;
    deletedAt?: string | null;
    owner: { $id: string } | string;
    users?: string[];
  };

  if (file.deletedAt) notFound();

  const ownerId =
    typeof file.owner === "string" ? file.owner : file.owner?.$id;
  const isOwner = ownerId === currentUser.$id;
  const isSharedWithMe =
    Array.isArray(file.users) && file.users.includes(currentUser.email);
  if (!isOwner && !isSharedWithMe) notFound();

  const url = constructFileUrl(file.bucketFileId);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <BeamSender
        file={{
          $id: file.$id,
          name: file.name,
          size: file.size,
          url,
          extension: file.extension,
          mimeType: file.mimeType,
        }}
      />
    </div>
  );
}
