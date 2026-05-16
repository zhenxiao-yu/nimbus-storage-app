"use server";

import { uploadFile as _uploadFile } from "@/lib/actions/file.upload";
import {
  getFiles as _getFiles,
  getTrashedFiles as _getTrashedFiles,
  getFileByShareToken as _getFileByShareToken,
  getTotalSpaceUsed as _getTotalSpaceUsed,
} from "@/lib/actions/file.query";
import {
  renameFile as _renameFile,
  updateFileUsers as _updateFileUsers,
  deleteFile as _deleteFile,
  restoreFile as _restoreFile,
  permanentlyDeleteFile as _permanentlyDeleteFile,
  createShareLink as _createShareLink,
  revokeShareLink as _revokeShareLink,
} from "@/lib/actions/file.mutate";

export async function uploadFile(props: UploadFileProps) {
  return _uploadFile(props);
}

export async function getFiles(props: GetFilesProps) {
  return _getFiles(props);
}

export async function getTrashedFiles(props: GetTrashedFilesProps = {}) {
  return _getTrashedFiles(props);
}

export async function getFileByShareToken(token: string) {
  return _getFileByShareToken(token);
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

export async function restoreFile(props: RestoreFileProps) {
  return _restoreFile(props);
}

export async function permanentlyDeleteFile(
  props: PermanentlyDeleteFileProps,
) {
  return _permanentlyDeleteFile(props);
}

export async function createShareLink(props: CreateShareLinkProps) {
  return _createShareLink(props);
}

export async function revokeShareLink(props: RevokeShareLinkProps) {
  return _revokeShareLink(props);
}
