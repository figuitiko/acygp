import { Prisma } from "@/generated/prisma/client";
import type { FileAssetWhereInput } from "@/generated/prisma/models/FileAsset";

import { createPagination } from "@/features/constancias/domain/pagination";
import { prisma } from "@/features/constancias/server/db";

import { normalizeFileSearchTerm } from "../domain/search";

const FILES_PAGE_SIZE = 10;

export class FolderNameExistsError extends Error {}

export class FolderHasFilesError extends Error {}

export class FolderHasSubfoldersError extends Error {}

export class FolderNotFoundError extends Error {}

export async function listFoldersWithCounts() {
  return prisma.fileCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { files: true, children: true } } },
  });
}

async function assertSiblingNameAvailable(name: string, parentId: string | null, excludeId?: string) {
  const existing = await prisma.fileCategory.findFirst({
    where: { name, parentId, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });

  if (existing) {
    throw new FolderNameExistsError(`Folder "${name}" already exists in this location`);
  }
}

export async function createFolder(name: string, parentId: string | null) {
  await assertSiblingNameAvailable(name, parentId);

  try {
    return await prisma.fileCategory.create({ data: { name, parentId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new FolderNameExistsError(`Folder "${name}" already exists in this location`);
    }

    throw error;
  }
}

export async function renameFolder(id: string, name: string) {
  const folder = await prisma.fileCategory.findUniqueOrThrow({ where: { id } });
  await assertSiblingNameAvailable(name, folder.parentId, id);

  try {
    return await prisma.fileCategory.update({ where: { id }, data: { name } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new FolderNameExistsError(`Folder "${name}" already exists in this location`);
    }

    throw error;
  }
}

export async function deleteFolder(id: string) {
  const counts = await prisma.fileCategory.findUniqueOrThrow({
    where: { id },
    include: { _count: { select: { files: true, children: true } } },
  });

  if (counts._count.files > 0) {
    throw new FolderHasFilesError(`Folder ${id} still has files assigned`);
  }

  if (counts._count.children > 0) {
    throw new FolderHasSubfoldersError(`Folder ${id} still has subfolders`);
  }

  return prisma.fileCategory.delete({ where: { id } });
}

export type CreateFileAssetInput = {
  name: string;
  blobUrl: string;
  blobPathname: string;
  contentType: string;
  size: number;
  categoryId: string;
};

export async function createFileAsset(input: CreateFileAssetInput) {
  return prisma.fileAsset.create({ data: input });
}

export async function getFileAssetById(id: string) {
  return prisma.fileAsset.findUnique({ where: { id } });
}

export async function renameFileAsset(id: string, name: string) {
  return prisma.fileAsset.update({ where: { id }, data: { name } });
}

export async function deleteFileAsset(id: string) {
  await prisma.fileAsset.delete({ where: { id } });
}

export async function moveFileToFolder(fileId: string, targetFolderId: string) {
  const folder = await prisma.fileCategory.findUnique({ where: { id: targetFolderId } });
  if (!folder) {
    throw new FolderNotFoundError(`Folder ${targetFolderId} does not exist`);
  }

  return prisma.fileAsset.update({ where: { id: fileId }, data: { categoryId: targetFolderId } });
}

export async function listFileAssetsPage({
  page,
  search,
  folderId,
}: {
  page?: string | number | null;
  search?: string | null;
  folderId?: string | null;
} = {}) {
  const where = createFileAssetsWhere(search, folderId);
  const totalItems = await prisma.fileAsset.count({ where });
  const pagination = createPagination({ page, pageSize: FILES_PAGE_SIZE, totalItems });

  const items = await prisma.fileAsset.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: pagination.offset,
    take: pagination.pageSize,
    include: { category: true },
  });

  return { items, pagination };
}

function createFileAssetsWhere(
  search: string | null | undefined,
  folderId: string | null | undefined
): FileAssetWhereInput | undefined {
  const normalizedSearch = normalizeFileSearchTerm(search);
  const searchClause: FileAssetWhereInput | undefined = normalizedSearch
    ? {
        OR: [
          { name: { contains: normalizedSearch, mode: "insensitive" } },
          { category: { name: { contains: normalizedSearch, mode: "insensitive" } } },
        ],
      }
    : undefined;

  if (searchClause && folderId) {
    return { AND: [searchClause, { categoryId: folderId }] };
  }

  return searchClause ?? (folderId ? { categoryId: folderId } : undefined);
}
