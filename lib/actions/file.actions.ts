"use server";

import { uploadFile as _uploadFile } from "@/lib/actions/file.upload";
import {
  getFiles as _getFiles,
  getTotalSpaceUsed as _getTotalSpaceUsed,
} from "@/lib/actions/file.query";
import {
  renameFile as _renameFile,
  updateFileUsers as _updateFileUsers,
  deleteFile as _deleteFile,
} from "@/lib/actions/file.mutate";

export async function uploadFile(props: UploadFileProps) {
  return _uploadFile(props);
}

export async function getFiles(props: GetFilesProps) {
  return _getFiles(props);
}

export async function getTotalSpaceUsed() {
  return _getTotalSpaceUsed();
}

export async function renameFile(props: RenameFileProps) {
  return _renameFile(props);
}

export async function updateFileUsers(props: UpdateFileUsersProps) {
  return _updateFileUsers(props);
}

export async function deleteFile(props: DeleteFileProps) {
  return _deleteFile(props);
}
