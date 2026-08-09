import { Prisma } from "@/generated/prisma/client";
import type { FileAssetWhereInput } from "@/generated/prisma/models/FileAsset";

import { createPagination } from "@/features/constancias/domain/pagination";
import { prisma } from "@/features/constancias/server/db";

import { normalizeFileSearchTerm } from "../domain/search";

const FILES_PAGE_SIZE = 10;

export class CategoryInUseError extends Error {}

export class CategoryExistsError extends Error {}

export async function listCategoriesWithCounts() {
  return prisma.fileCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { files: true } } },
  });
}

export async function createCategory(name: string) {
  try {
    return await prisma.fileCategory.create({ data: { name } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new CategoryExistsError(`Category "${name}" already exists`);
    }

    throw error;
  }
}

export async function renameCategory(id: string, name: string) {
  try {
    return await prisma.fileCategory.update({ where: { id }, data: { name } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new CategoryExistsError(`Category "${name}" already exists`);
    }

    throw error;
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.fileCategory.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      throw new CategoryInUseError(`Category ${id} still has files assigned`);
    }

    throw error;
  }
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

export type CreateFileAssetWithNewCategoryInput = Omit<CreateFileAssetInput, "categoryId"> & {
  categoryName: string;
};

export async function createFileAssetWithNewCategory(input: CreateFileAssetWithNewCategoryInput) {
  const { categoryName, ...fileInput } = input;

  return prisma.$transaction(async (tx) => {
    const category = await tx.fileCategory.upsert({
      where: { name: categoryName },
      create: { name: categoryName },
      update: {},
    });

    return tx.fileAsset.create({
      data: { ...fileInput, categoryId: category.id },
    });
  });
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

export async function listFileAssetsPage({
  page,
  search,
  categoryId,
}: {
  page?: string | number | null;
  search?: string | null;
  categoryId?: string | null;
} = {}) {
  const where = createFileAssetsWhere(search, categoryId);
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
  categoryId: string | null | undefined
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

  if (searchClause && categoryId) {
    return { AND: [searchClause, { categoryId }] };
  }

  return searchClause ?? (categoryId ? { categoryId } : undefined);
}
