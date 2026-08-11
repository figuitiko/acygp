"use server";

import { randomUUID } from "node:crypto";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  clearAdminSessionCookie,
  isAdminAuthenticated,
  isValidAdminPassword,
  setAdminSessionCookie,
} from "@/features/constancias/server/admin-auth";

import { sanitizeFileName, validateFileUpload } from "../domain/file";
import {
  FolderHasFilesError,
  FolderHasSubfoldersError,
  FolderNameExistsError,
  FolderNotFoundError,
  createFileAsset,
  createFolder,
  deleteFileAsset,
  deleteFolder,
  getFileAssetById,
  moveFileToFolder,
  renameFileAsset,
  renameFolder,
} from "./repository";

const FILES_PATH = "/admin/archivos";

const idAndNameSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1, "El nombre es obligatorio"),
});

const newFolderSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  parentId: z
    .string()
    .trim()
    .transform((value) => (value.length > 0 ? value : null)),
});

const moveFileSchema = z.object({
  id: z.string().trim().min(1),
  folderId: z.string().trim().min(1),
});

export async function loginArchivosAdmin(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!isValidAdminPassword(password)) {
    redirect(`${FILES_PATH}?auth=invalid`);
  }

  await setAdminSessionCookie();
  redirect(FILES_PATH);
}

export async function logoutArchivosAdmin() {
  await clearAdminSessionCookie();
  redirect(FILES_PATH);
}

async function requireArchivosAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect(`${FILES_PATH}?auth=required`);
  }
}

function buildRedirect(folderId: string | null, statusParam: string) {
  return `${FILES_PATH}${folderId ? `?folderId=${folderId}&` : "?"}${statusParam}`;
}

function readReturnFolderId(formData: FormData) {
  const value = formData.get("returnFolderId");
  return typeof value === "string" && value.length > 0 ? value : null;
}

export async function createFolderFromForm(formData: FormData) {
  await requireArchivosAdmin();

  const result = newFolderSchema.safeParse({
    name: formData.get("name"),
    parentId: formData.get("parentId") ?? "",
  });

  if (!result.success) {
    redirect(`${FILES_PATH}?error=invalid-data`);
  }

  try {
    await createFolder(result.data.name, result.data.parentId);
  } catch (error) {
    if (error instanceof FolderNameExistsError) {
      redirect(`${FILES_PATH}?error=folder-exists`);
    }

    throw error;
  }

  revalidatePath(FILES_PATH);
  redirect(buildRedirect(result.data.parentId, "folderCreated=1"));
}

export async function renameFolderFromForm(formData: FormData) {
  await requireArchivosAdmin();

  const result = idAndNameSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
  });

  if (!result.success) {
    redirect(`${FILES_PATH}?error=invalid-data`);
  }

  try {
    await renameFolder(result.data.id, result.data.name);
  } catch (error) {
    if (error instanceof FolderNameExistsError) {
      redirect(`${FILES_PATH}?error=folder-exists`);
    }

    throw error;
  }

  revalidatePath(FILES_PATH);
  redirect(buildRedirect(result.data.id, "folderRenamed=1"));
}

export async function deleteFolderFromForm(formData: FormData) {
  await requireArchivosAdmin();

  const id = String(formData.get("id") ?? "");
  let parentId: string | null = null;

  try {
    const deleted = await deleteFolder(id);
    parentId = deleted.parentId;
  } catch (error) {
    if (error instanceof FolderHasFilesError) {
      redirect(`${FILES_PATH}?error=folder-has-files`);
    }

    if (error instanceof FolderHasSubfoldersError) {
      redirect(`${FILES_PATH}?error=folder-has-subfolders`);
    }

    throw error;
  }

  revalidatePath(FILES_PATH);
  redirect(buildRedirect(parentId, "folderDeleted=1"));
}

export async function uploadFileFromForm(formData: FormData) {
  await requireArchivosAdmin();

  const file = formData.get("file");
  const folderId = String(formData.get("folderId") ?? "");

  if (!(file instanceof File) || file.size === 0 || !folderId) {
    redirect(`${FILES_PATH}?error=invalid-data`);
  }

  const validationError = validateFileUpload({
    name: file.name,
    size: file.size,
    contentType: file.type,
  });

  if (validationError) {
    redirect(`${FILES_PATH}?error=${validationError}`);
  }

  const safeName = sanitizeFileName(file.name);
  let blob;

  try {
    blob = await put(`archivos/${randomUUID()}-${safeName}`, file, {
      access: "public",
      contentType: file.type || undefined,
    });
  } catch (error) {
    console.error("Failed to upload file to blob storage", error);
    redirect(`${FILES_PATH}?error=upload-failed`);
  }

  await createFileAsset({
    name: safeName,
    blobUrl: blob.url,
    blobPathname: blob.pathname,
    contentType: file.type,
    size: file.size,
    categoryId: folderId,
  });

  revalidatePath(FILES_PATH);
  redirect(buildRedirect(folderId, `uploaded=${encodeURIComponent(safeName)}`));
}

export async function moveFileFromForm(formData: FormData) {
  await requireArchivosAdmin();

  const result = moveFileSchema.safeParse({
    id: formData.get("id"),
    folderId: formData.get("folderId"),
  });

  if (!result.success) {
    redirect(`${FILES_PATH}?error=invalid-data`);
  }

  try {
    await moveFileToFolder(result.data.id, result.data.folderId);
  } catch (error) {
    if (error instanceof FolderNotFoundError) {
      redirect(`${FILES_PATH}?error=invalid-data`);
    }

    throw error;
  }

  revalidatePath(FILES_PATH);
  redirect(buildRedirect(readReturnFolderId(formData), "fileMoved=1"));
}

export async function renameFileFromForm(formData: FormData) {
  await requireArchivosAdmin();

  const result = idAndNameSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
  });

  if (!result.success) {
    redirect(`${FILES_PATH}?error=invalid-data`);
  }

  await renameFileAsset(result.data.id, result.data.name);

  revalidatePath(FILES_PATH);
  redirect(buildRedirect(readReturnFolderId(formData), "fileRenamed=1"));
}

export async function deleteFileFromForm(formData: FormData) {
  await requireArchivosAdmin();

  const id = String(formData.get("id") ?? "");
  const file = await getFileAssetById(id);

  if (!file) {
    redirect(`${FILES_PATH}?error=invalid-data`);
  }

  try {
    await del(file.blobUrl);
  } catch (error) {
    console.error(`Failed to delete blob ${file.blobPathname}`, error);
  }

  await deleteFileAsset(id);

  revalidatePath(FILES_PATH);
  redirect(buildRedirect(readReturnFolderId(formData), "fileDeleted=1"));
}
