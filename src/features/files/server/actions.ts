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

import { normalizeCategoryName } from "../domain/category";
import { sanitizeFileName, validateFileUpload } from "../domain/file";
import {
  CategoryInUseError,
  createCategory,
  createFileAsset,
  createFileAssetWithNewCategory,
  deleteCategory,
  deleteFileAsset,
  getFileAssetById,
  renameCategory,
  renameFileAsset,
} from "./repository";

const FILES_PATH = "/admin/archivos";

const idAndNameSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1, "El nombre es obligatorio"),
});

const newCategoryNameSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
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

export async function createCategoryFromForm(formData: FormData) {
  await requireArchivosAdmin();

  const result = newCategoryNameSchema.safeParse({ name: formData.get("name") });

  if (!result.success) {
    redirect(`${FILES_PATH}?error=invalid-data`);
  }

  await createCategory(result.data.name);

  revalidatePath(FILES_PATH);
  redirect(`${FILES_PATH}?categoryCreated=1`);
}

export async function renameCategoryFromForm(formData: FormData) {
  await requireArchivosAdmin();

  const result = idAndNameSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
  });

  if (!result.success) {
    redirect(`${FILES_PATH}?error=invalid-data`);
  }

  await renameCategory(result.data.id, result.data.name);

  revalidatePath(FILES_PATH);
  redirect(`${FILES_PATH}?categoryRenamed=1`);
}

export async function deleteCategoryFromForm(formData: FormData) {
  await requireArchivosAdmin();

  const id = String(formData.get("id") ?? "");

  try {
    await deleteCategory(id);
  } catch (error) {
    if (error instanceof CategoryInUseError) {
      redirect(`${FILES_PATH}?error=category-in-use`);
    }

    throw error;
  }

  revalidatePath(FILES_PATH);
  redirect(`${FILES_PATH}?categoryDeleted=1`);
}

export async function uploadFileFromForm(formData: FormData) {
  await requireArchivosAdmin();

  const file = formData.get("file");
  const categoryId = String(formData.get("categoryId") ?? "");
  const newCategoryName = normalizeCategoryName(String(formData.get("newCategoryName") ?? ""));

  if (!(file instanceof File) || file.size === 0 || (!categoryId && !newCategoryName)) {
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
  const blob = await put(`archivos/${randomUUID()}-${safeName}`, file, {
    access: "public",
    contentType: file.type || undefined,
  });

  if (newCategoryName) {
    await createFileAssetWithNewCategory({
      name: safeName,
      blobUrl: blob.url,
      blobPathname: blob.pathname,
      contentType: file.type,
      size: file.size,
      categoryName: newCategoryName,
    });
  } else {
    await createFileAsset({
      name: safeName,
      blobUrl: blob.url,
      blobPathname: blob.pathname,
      contentType: file.type,
      size: file.size,
      categoryId,
    });
  }

  revalidatePath(FILES_PATH);
  redirect(`${FILES_PATH}?uploaded=${encodeURIComponent(safeName)}`);
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
  redirect(`${FILES_PATH}?fileRenamed=1`);
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
  redirect(`${FILES_PATH}?fileDeleted=1`);
}
