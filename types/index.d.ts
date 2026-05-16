/* eslint-disable no-unused-vars */

declare type FileType = "document" | "image" | "video" | "audio" | "other";

declare interface ActionType {
  label: string;
  icon: React.ElementType | string;
  value: string;
}

declare type SegmentParams = {
  type?: string;
};

declare interface SearchParamProps {
  params?: Promise<SegmentParams>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

declare interface UploadFileProps {
  file: File;
  ownerId: string;
  accountId: string;
  path: string;
}
declare interface GetFilesProps {
  types: FileType[];
  searchText?: string;
  sort?: string;
  limit?: number;
  /**
   * Optional folder filter.
   * - `undefined` (default): return files across every folder + root.
   * - `null`: return only loose files at the root (folderId is null/missing).
   * - string: return files inside that folder.
   */
  folderId?: string | null;
}
declare interface GetTrashedFilesProps {
  searchText?: string;
  sort?: string;
}
declare interface RenameFileProps {
  fileId: string;
  name: string;
  extension: string;
  path: string;
}
declare interface UpdateFileUsersProps {
  fileId: string;
  emails: string[];
  path: string;
}
declare interface DeleteFileProps {
  fileId: string;
  path: string;
}
declare interface RestoreFileProps {
  fileId: string;
  path: string;
}
declare interface PermanentlyDeleteFileProps {
  fileId: string;
  bucketFileId: string;
  path: string;
}
declare interface CreateShareLinkProps {
  fileId: string;
  daysValid: number;
  path: string;
}
declare interface RevokeShareLinkProps {
  fileId: string;
  path: string;
}

declare interface CreateFolderProps {
  name: string;
  parentId?: string | null;
  path: string;
}
declare interface RenameFolderProps {
  folderId: string;
  name: string;
  path: string;
}
declare interface DeleteFolderProps {
  folderId: string;
  path: string;
}
declare interface GetFoldersProps {
  parentId?: string | null;
}
declare interface MoveFileProps {
  fileId: string;
  folderId: string | null;
  path: string;
}

declare interface FileUploaderProps {
  ownerId: string;
  accountId: string;
  className?: string;
}

declare interface MobileNavigationProps {
  $id: string;
  accountId: string;
  fullName: string;
  avatar: string;
  email: string;
}
declare interface SidebarProps {
  fullName: string;
  avatar: string;
  email: string;
}

declare interface ThumbnailProps {
  type: string;
  extension: string;
  url?: string;
  bucketFileId?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  imageClassName?: string;
}

declare interface TotalSpaceBucket {
  size: number;
  latestDate: string;
}

declare interface TotalSpace {
  image: TotalSpaceBucket;
  document: TotalSpaceBucket;
  video: TotalSpaceBucket;
  audio: TotalSpaceBucket;
  other: TotalSpaceBucket;
  used: number;
  all: number;
}
