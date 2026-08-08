# Admin File Library (Vercel Blob) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an admin-only file library at `/admin/archivos` — admins upload files (<4MB) to Vercel Blob, organize them into categories, and CRUD both files and categories, with inline "select or create category" on upload.

**Architecture:** New feature module `src/features/files/` mirroring the existing `src/features/constancias/` structure exactly: `domain/` (pure, unit-tested validation/normalization), `server/` (Prisma repository + `"use server"` actions using native `<form action>` + redirect-with-query-param status messages, no client fetch/JSON API), `client/` (two small interactive components). Single admin route `/admin/archivos` reusing the existing shared `/admin`-scoped cookie session.

**Tech Stack:** Next.js 16 (App Router, Server Actions), Prisma 7 (`@prisma/adapter-pg`), `@vercel/blob` (new dependency), Zod, Vitest, Tailwind.

## Global Constraints

- Follow `src/features/constancias/` conventions exactly: native `<form action={serverAction}>`, zod `safeParse` for text-field validation, `revalidatePath` + `redirect("<path>?statusCode=...")` for every outcome (success and known-invalid input), cookie auth via `isAdminAuthenticated()` / `isValidAdminPassword()` / `setAdminSessionCookie()` / `clearAdminSessionCookie()` imported from `@/features/constancias/server/admin-auth` (shared `/admin`-path cookie — do not add new auth).
- Reuse `prisma` client from `@/features/constancias/server/db` (do not create a new Prisma client instance) and `createPagination` from `@/features/constancias/domain/pagination` (already generic, already used cross-feature by `evaluaciones`).
- Testing: **only pure `domain/` functions get Vitest unit tests**, matching the existing precedent — `constancias`' and `evaluaciones`' `server/repository.ts` and `server/actions.ts` have zero test files (no test DB harness exists in this repo). Do not add repository/action/component tests; that would diverge from the codebase's established pattern.
- Never run `npm run build` (project rule — production build is out of scope for implementation work). Use `npx tsc --noEmit` to verify types and `npm run test` / `npm run lint` for verification instead.
- No public-facing consumption of these files — admin-only, per explicit requirement.
- Spanish UI copy throughout, matching existing admin pages' tone (voseo: "Subí", "Creá", "Eliminá").
- Commit after every task (conventional commits, no AI attribution — this repo's `git log` uses plain messages like `feat: ...`, `fix: ...`).

---

### Task 1: Database schema, dependency, and env var

**Files:**
- Modify: `prisma/schema.prisma` (append after the `EvaluationAnswer` model, end of file)
- Create: `prisma/migrations/20260808120000_add_file_library/migration.sql`
- Modify: `.env.example`
- Modify: `package.json` (via `npm install`)

**Interfaces:**
- Produces: Prisma models `FileCategory` (`id`, `name` unique, `createdAt`, `files` relation) and `FileAsset` (`id`, `name`, `blobUrl`, `blobPathname`, `contentType`, `size`, `categoryId` FK `onDelete: Restrict`, `createdAt`), generated client types available at `@/generated/prisma/client` and `@/generated/prisma/models/FileAsset`. Every later task depends on these existing and on `@vercel/blob`'s `put`/`del` being importable.

- [ ] **Step 1: Append the new models to the schema**

Add to the end of `prisma/schema.prisma`:

```prisma
model FileCategory {
  id        String      @id @default(cuid())
  name      String      @unique
  createdAt DateTime    @default(now())
  files     FileAsset[]
}

model FileAsset {
  id           String       @id @default(cuid())
  name         String
  blobUrl      String
  blobPathname String
  contentType  String
  size         Int
  categoryId   String
  category     FileCategory @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  createdAt    DateTime     @default(now())

  @@index([categoryId])
}
```

- [ ] **Step 2: Create the migration**

Run: `npx prisma migrate dev --name add_file_library`

If this fails because the sandbox/environment has no network access to `DATABASE_URL` (it has before in this project — check for a connection-refused or DNS error), fall back to creating the migration by hand instead, so `prisma generate` (which needs no DB access) can still produce a client that matches the schema:

```bash
mkdir -p prisma/migrations/20260808120000_add_file_library
```

Create `prisma/migrations/20260808120000_add_file_library/migration.sql`:

```sql
-- CreateTable
CREATE TABLE "FileCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FileAsset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "blobUrl" TEXT NOT NULL,
    "blobPathname" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FileCategory_name_key" ON "FileCategory"("name");

-- CreateIndex
CREATE INDEX "FileAsset_categoryId_idx" ON "FileAsset"("categoryId");

-- AddForeignKey
ALTER TABLE "FileAsset" ADD CONSTRAINT "FileAsset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FileCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

Then run: `npx prisma generate`

Note for the human operator (leave this as-is, do not try to work around it): if the migration was hand-written because the DB was unreachable, it still needs to be applied against the real database with `npm run db:migrate` (`prisma migrate deploy`) before this feature works in any real environment — flag this in your final report.

- [ ] **Step 3: Verify the client generated correctly**

Run: `rg -n "FileAsset" src/generated/prisma/client.ts`
Expected: at least one match (the generated `FileAsset` type export). If nothing matches, `prisma generate` didn't pick up the schema change — re-check Step 1/2 before continuing.

- [ ] **Step 4: Install `@vercel/blob`**

Run: `npm install @vercel/blob`

- [ ] **Step 5: Add the env var**

Add to `.env.example` (after `NEXT_PUBLIC_SITE_URL`):

```
BLOB_READ_WRITE_TOKEN=
```

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations .env.example package.json package-lock.json
git commit -m "feat: add file library schema and vercel blob dependency"
```

---

### Task 2: Domain layer — validation and normalization (TDD)

**Files:**
- Create: `src/features/files/domain/file.ts`
- Test: `src/features/files/domain/file.test.ts`
- Create: `src/features/files/domain/category.ts`
- Test: `src/features/files/domain/category.test.ts`
- Create: `src/features/files/domain/search.ts`
- Test: `src/features/files/domain/search.test.ts`

**Interfaces:**
- Produces: `MAX_FILE_SIZE_BYTES: number`, `ALLOWED_FILE_CONTENT_TYPES: Set<string>`, `type FileValidationError = "empty-name" | "file-too-large" | "unsupported-type"`, `validateFileUpload(input: { name: string; size: number; contentType: string }): FileValidationError | null`, `sanitizeFileName(name: string): string` from `file.ts`. `normalizeCategoryName(name?: string | null): string | null` from `category.ts`. `normalizeFileSearchTerm(search?: string | null): string | null` from `search.ts`. Task 3 (repository) and Task 4 (actions) import all of these directly.

- [ ] **Step 1: Write the failing tests for `file.ts`**

Create `src/features/files/domain/file.test.ts`:

```typescript
import { describe, expect, it } from "vitest";

import { sanitizeFileName, validateFileUpload } from "./file";

describe("validateFileUpload", () => {
  const validInput = { name: "formulario.pdf", size: 1024, contentType: "application/pdf" };

  it("accepts a small, allowed file", () => {
    expect(validateFileUpload(validInput)).toBeNull();
  });

  it("rejects a blank name", () => {
    expect(validateFileUpload({ ...validInput, name: "   " })).toBe("empty-name");
  });

  it("rejects files over 4MB", () => {
    expect(validateFileUpload({ ...validInput, size: 4 * 1024 * 1024 + 1 })).toBe("file-too-large");
  });

  it("rejects empty files", () => {
    expect(validateFileUpload({ ...validInput, size: 0 })).toBe("file-too-large");
  });

  it("rejects unsupported content types", () => {
    expect(validateFileUpload({ ...validInput, contentType: "application/zip" })).toBe("unsupported-type");
  });
});

describe("sanitizeFileName", () => {
  it("trims and collapses whitespace", () => {
    expect(sanitizeFileName("  formulario   de registro.pdf  ")).toBe("formulario de registro.pdf");
  });

  it("replaces path and reserved characters with a dash", () => {
    expect(sanitizeFileName('a/b\\c?d%e*f:g|h"i<j>k.pdf')).toBe("a-b-c-d-e-f-g-h-i-j-k.pdf");
  });
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run: `npx vitest run src/features/files/domain/file.test.ts`
Expected: FAIL — `Cannot find module './file'` (file doesn't exist yet).

- [ ] **Step 3: Implement `file.ts`**

Create `src/features/files/domain/file.ts`:

```typescript
export const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

export const ALLOWED_FILE_CONTENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
]);

export type FileValidationError = "empty-name" | "file-too-large" | "unsupported-type";

export function validateFileUpload(input: {
  name: string;
  size: number;
  contentType: string;
}): FileValidationError | null {
  if (!input.name.trim()) {
    return "empty-name";
  }

  if (input.size <= 0 || input.size > MAX_FILE_SIZE_BYTES) {
    return "file-too-large";
  }

  if (!ALLOWED_FILE_CONTENT_TYPES.has(input.contentType)) {
    return "unsupported-type";
  }

  return null;
}

export function sanitizeFileName(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[/\\?%*:|"<>]/g, "-");
}
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `npx vitest run src/features/files/domain/file.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Write the failing test for `category.ts`**

Create `src/features/files/domain/category.test.ts`:

```typescript
import { describe, expect, it } from "vitest";

import { normalizeCategoryName } from "./category";

describe("normalizeCategoryName", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeCategoryName("  Formularios   internos  ")).toBe("Formularios internos");
  });

  it("returns null for blank names", () => {
    expect(normalizeCategoryName("   ")).toBeNull();
    expect(normalizeCategoryName(undefined)).toBeNull();
    expect(normalizeCategoryName(null)).toBeNull();
  });
});
```

- [ ] **Step 6: Run it, verify it fails, then implement `category.ts`**

Run: `npx vitest run src/features/files/domain/category.test.ts` — expect FAIL (module not found).

Create `src/features/files/domain/category.ts`:

```typescript
export function normalizeCategoryName(name?: string | null): string | null {
  const normalized = name?.trim().replace(/\s+/g, " ") ?? "";
  return normalized.length > 0 ? normalized : null;
}
```

Run: `npx vitest run src/features/files/domain/category.test.ts` — expect PASS (2 tests).

- [ ] **Step 7: Write the failing test for `search.ts`**

Create `src/features/files/domain/search.test.ts`:

```typescript
import { describe, expect, it } from "vitest";

import { normalizeFileSearchTerm } from "./search";

describe("normalizeFileSearchTerm", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeFileSearchTerm("  formulario   registro  ")).toBe("formulario registro");
  });

  it("returns null for blank searches", () => {
    expect(normalizeFileSearchTerm("   ")).toBeNull();
    expect(normalizeFileSearchTerm(undefined)).toBeNull();
  });
});
```

- [ ] **Step 8: Run it, verify it fails, then implement `search.ts`**

Run: `npx vitest run src/features/files/domain/search.test.ts` — expect FAIL (module not found).

Create `src/features/files/domain/search.ts`:

```typescript
export function normalizeFileSearchTerm(search?: string | null): string | null {
  const normalized = search?.trim().replace(/\s+/g, " ") ?? "";
  return normalized.length > 0 ? normalized : null;
}
```

Run: `npx vitest run src/features/files/domain/search.test.ts` — expect PASS (2 tests).

- [ ] **Step 9: Run the full domain suite and commit**

Run: `npx vitest run src/features/files/domain`
Expected: PASS, 11 tests total.

```bash
git add src/features/files/domain
git commit -m "feat: add file library domain validation and normalization"
```

---

### Task 3: Repository layer (Prisma CRUD)

**Files:**
- Create: `src/features/files/server/repository.ts`

**Interfaces:**
- Consumes: `prisma` from `@/features/constancias/server/db`; `createPagination` from `@/features/constancias/domain/pagination`; `Prisma` namespace from `@/generated/prisma/client`; `FileAssetWhereInput` type from `@/generated/prisma/models/FileAsset`; `normalizeFileSearchTerm` from `../domain/search`.
- Produces (consumed by Task 4 actions and Task 6 page): `class CategoryInUseError extends Error`; `listCategoriesWithCounts(): Promise<Array<{ id: string; name: string; createdAt: Date; _count: { files: number } }>>`; `createCategory(name: string)`; `renameCategory(id: string, name: string)`; `deleteCategory(id: string): Promise<void>` (throws `CategoryInUseError` if the category still has files); `type CreateFileAssetInput = { name: string; blobUrl: string; blobPathname: string; contentType: string; size: number; categoryId: string }`; `createFileAsset(input: CreateFileAssetInput)`; `type CreateFileAssetWithNewCategoryInput = Omit<CreateFileAssetInput, "categoryId"> & { categoryName: string }`; `createFileAssetWithNewCategory(input: CreateFileAssetWithNewCategoryInput)` (upserts the category by name inside a transaction, so typing an existing category's name reuses it instead of erroring); `getFileAssetById(id: string)`; `renameFileAsset(id: string, name: string)`; `deleteFileAsset(id: string): Promise<void>`; `listFileAssetsPage({ page, search }?: { page?: string | number | null; search?: string | null }): Promise<{ items: Array<FileAsset & { category: FileCategory }>; pagination: ReturnType<typeof createPagination> }>`.

- [ ] **Step 1: Write the repository**

Create `src/features/files/server/repository.ts`:

```typescript
import { Prisma } from "@/generated/prisma/client";
import type { FileAssetWhereInput } from "@/generated/prisma/models/FileAsset";

import { createPagination } from "@/features/constancias/domain/pagination";
import { prisma } from "@/features/constancias/server/db";

import { normalizeFileSearchTerm } from "../domain/search";

const FILES_PAGE_SIZE = 10;

export class CategoryInUseError extends Error {}

export async function listCategoriesWithCounts() {
  return prisma.fileCategory.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { files: true } } },
  });
}

export async function createCategory(name: string) {
  return prisma.fileCategory.create({ data: { name } });
}

export async function renameCategory(id: string, name: string) {
  return prisma.fileCategory.update({ where: { id }, data: { name } });
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
}: {
  page?: string | number | null;
  search?: string | null;
} = {}) {
  const where = createFileAssetsSearchWhere(search);
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

function createFileAssetsSearchWhere(search?: string | null): FileAssetWhereInput | undefined {
  const normalizedSearch = normalizeFileSearchTerm(search);

  if (!normalizedSearch) {
    return undefined;
  }

  return {
    OR: [
      { name: { contains: normalizedSearch, mode: "insensitive" } },
      { category: { name: { contains: normalizedSearch, mode: "insensitive" } } },
    ],
  };
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/features/files/server/repository.ts`. (Pre-existing unrelated errors, if any, are not this task's concern — but there should be none in this repo.)

- [ ] **Step 3: Commit**

```bash
git add src/features/files/server/repository.ts
git commit -m "feat: add file library repository"
```

---

### Task 4: Server actions

**Files:**
- Create: `src/features/files/server/actions.ts`

**Interfaces:**
- Consumes: `isAdminAuthenticated`, `isValidAdminPassword`, `setAdminSessionCookie`, `clearAdminSessionCookie` from `@/features/constancias/server/admin-auth`; `sanitizeFileName`, `validateFileUpload` from `../domain/file`; `normalizeCategoryName` from `../domain/category`; everything produced by Task 3's `./repository`.
- Produces (consumed by Task 6 page): `loginArchivosAdmin(formData: FormData)`, `logoutArchivosAdmin()`, `createCategoryFromForm(formData: FormData)`, `renameCategoryFromForm(formData: FormData)`, `deleteCategoryFromForm(formData: FormData)`, `uploadFileFromForm(formData: FormData)`, `renameFileFromForm(formData: FormData)`, `deleteFileFromForm(formData: FormData)` — all `"use server"` actions taking a `FormData` (or nothing) and returning `void` (they always `redirect()`).

- [ ] **Step 1: Write the actions**

Create `src/features/files/server/actions.ts`:

```typescript
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors referencing `src/features/files/server/actions.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/features/files/server/actions.ts
git commit -m "feat: add file library server actions"
```

---

### Task 5: Admin navigation entry (TDD) and shared client components

**Files:**
- Modify: `src/features/admin/navigation.ts:6-9`
- Modify: `src/features/admin/navigation.test.ts:7-10`
- Create: `src/features/files/client/confirm-delete-form.tsx`
- Create: `src/features/files/client/upload-form.tsx`

**Interfaces:**
- Consumes: `SubmitButton` from `@/features/admin/submit-button`.
- Produces (consumed by Task 6 page): `ConfirmDeleteForm({ triggerLabel, title, description, confirmLabel, pendingLabel, action, hiddenFields }: { triggerLabel: string; title: string; description: string; confirmLabel: string; pendingLabel: string; action: (formData: FormData) => void | Promise<void>; hiddenFields: Record<string, string> })`; `UploadFileForm({ categories, action }: { categories: Array<{ id: string; name: string }>; action: (formData: FormData) => void | Promise<void> })`.

- [ ] **Step 1: Update the navigation test to expect the new entry (red)**

In `src/features/admin/navigation.test.ts`, replace:

```typescript
    expect(getAdminNavigationItems()).toEqual([
      { label: "Constancias", href: "/admin/constancias" },
      { label: "Evaluaciones", href: "/admin/evaluaciones" },
    ]);
```

with:

```typescript
    expect(getAdminNavigationItems()).toEqual([
      { label: "Constancias", href: "/admin/constancias" },
      { label: "Evaluaciones", href: "/admin/evaluaciones" },
      { label: "Archivos", href: "/admin/archivos" },
    ]);
```

- [ ] **Step 2: Run it and verify it fails**

Run: `npx vitest run src/features/admin/navigation.test.ts`
Expected: FAIL — array length/content mismatch.

- [ ] **Step 3: Add the navigation entry (green)**

In `src/features/admin/navigation.ts`, replace:

```typescript
const ADMIN_NAVIGATION_ITEMS: AdminNavigationItem[] = [
  { label: "Constancias", href: "/admin/constancias" },
  { label: "Evaluaciones", href: "/admin/evaluaciones" },
];
```

with:

```typescript
const ADMIN_NAVIGATION_ITEMS: AdminNavigationItem[] = [
  { label: "Constancias", href: "/admin/constancias" },
  { label: "Evaluaciones", href: "/admin/evaluaciones" },
  { label: "Archivos", href: "/admin/archivos" },
];
```

- [ ] **Step 4: Run it and verify it passes**

Run: `npx vitest run src/features/admin/navigation.test.ts`
Expected: PASS.

- [ ] **Step 5: Build the shared delete-confirmation component**

Create `src/features/files/client/confirm-delete-form.tsx` (interaction pattern copied from `src/features/constancias/client/revoke-confirmation-form.tsx`, generalized for reuse by both files and categories in Task 6):

```tsx
"use client";

import { useId, useState } from "react";

import { SubmitButton } from "@/features/admin/submit-button";

type ConfirmDeleteFormProps = {
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: Record<string, string>;
};

export function ConfirmDeleteForm({
  triggerLabel,
  title,
  description,
  confirmLabel,
  pendingLabel,
  action,
  hiddenFields,
}: ConfirmDeleteFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50"
      >
        {triggerLabel}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-red-600">Confirmar acción</p>
            <h3 id={titleId} className="mt-2 text-2xl font-bold text-slate-950">
              {title}
            </h3>
            <p className="mt-3 text-slate-600">{description}</p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <form action={action}>
                {Object.entries(hiddenFields).map(([fieldName, fieldValue]) => (
                  <input key={fieldName} type="hidden" name={fieldName} value={fieldValue} />
                ))}
                <SubmitButton
                  className="rounded-lg bg-red-600 px-4 py-2 font-bold text-white transition hover:bg-red-700"
                  pendingLabel={pendingLabel}
                >
                  {confirmLabel}
                </SubmitButton>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 6: Build the upload form**

Create `src/features/files/client/upload-form.tsx`:

```tsx
"use client";

import { useState } from "react";

import { SubmitButton } from "@/features/admin/submit-button";

type Category = { id: string; name: string };

type UploadFileFormProps = {
  categories: Category[];
  action: (formData: FormData) => void | Promise<void>;
};

export function UploadFileForm({ categories, action }: UploadFileFormProps) {
  const [isCreatingCategory, setIsCreatingCategory] = useState(categories.length === 0);

  return (
    <form action={action} className="flex flex-col gap-4" encType="multipart/form-data">
      <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
        Archivo
        <input
          name="file"
          type="file"
          required
          className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-main focus:ring-2 focus:ring-main/20"
        />
      </label>

      {isCreatingCategory ? (
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
          Nueva categoría
          <input
            name="newCategoryName"
            required
            placeholder="Ej. Formularios"
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-main focus:ring-2 focus:ring-main/20"
          />
        </label>
      ) : (
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
          Categoría
          <select
            name="categoryId"
            required
            className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-main focus:ring-2 focus:ring-main/20"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {categories.length > 0 && (
        <button
          type="button"
          onClick={() => setIsCreatingCategory((current) => !current)}
          className="self-start text-sm font-bold text-main hover:underline"
        >
          {isCreatingCategory ? "Elegir categoría existente" : "+ Nueva categoría"}
        </button>
      )}

      <SubmitButton
        className="rounded-lg bg-main px-4 py-3 font-bold text-white transition hover:bg-blue-800"
        pendingLabel="Subiendo…"
      >
        Subir archivo
      </SubmitButton>
    </form>
  );
}
```

- [ ] **Step 7: Type-check and run the full test suite**

Run: `npx tsc --noEmit && npm run test`
Expected: no type errors in the new files; all tests pass (constancias, evaluaciones, and the new files-domain and navigation tests).

- [ ] **Step 8: Commit**

```bash
git add src/features/admin/navigation.ts src/features/admin/navigation.test.ts src/features/files/client
git commit -m "feat: add archivos nav entry and file library client components"
```

---

### Task 6: Admin page, loading, and error boundary

**Files:**
- Create: `src/app/admin/archivos/page.tsx`
- Create: `src/app/admin/archivos/loading.tsx`
- Create: `src/app/admin/archivos/error.tsx`

**Interfaces:**
- Consumes: everything produced by Tasks 3, 4, and 5 (`repository.ts`, `actions.ts`, `confirm-delete-form.tsx`, `upload-form.tsx`), plus `AdminNavigation` from `@/features/admin/admin-navigation`, `AdminRouteSkeleton` from `@/features/admin/admin-route-skeleton`, `SubmitButton` from `@/features/admin/submit-button`, `isAdminAuthenticated` from `@/features/constancias/server/admin-auth`.
- Produces: the route itself — no other task depends on this one.

- [ ] **Step 1: Write the loading state**

Create `src/app/admin/archivos/loading.tsx`:

```tsx
import { AdminRouteSkeleton } from "@/features/admin/admin-route-skeleton";

export default function AdminArchivosLoading() {
  return <AdminRouteSkeleton currentPath="/admin/archivos" />;
}
```

- [ ] **Step 2: Write the error boundary**

Create `src/app/admin/archivos/error.tsx`:

```tsx
"use client";

import Link from "next/link";

import { AdminNavigation } from "@/features/admin/admin-navigation";

export default function AdminArchivosError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-[calc(100vh-220px)] bg-slate-50 px-4 py-10 lg:px-24">
      <section className="mx-auto flex max-w-4xl flex-col gap-6">
        <AdminNavigation currentPath="/admin/archivos" />
        <div className="rounded-2xl border border-red-100 bg-white p-8 shadow-xl">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-600">No pudimos cargar archivos</p>
          <h1 className="mt-2 text-3xl font-bold text-main">Intentá de nuevo</h1>
          <p className="mt-3 text-slate-600">
            La información interna no se cargó correctamente. Podés reintentar o volver al inicio del admin.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={reset}
              className="rounded-lg bg-main px-5 py-3 font-bold text-white transition hover:bg-blue-800"
            >
              Reintentar
            </button>
            <Link
              href="/admin/constancias"
              className="rounded-lg border border-slate-300 px-5 py-3 font-bold text-main transition hover:bg-slate-50"
            >
              Ir a constancias
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Write the page**

Create `src/app/admin/archivos/page.tsx`:

```tsx
import type { ReactNode } from "react";

import Link from "next/link";

import { AdminNavigation } from "@/features/admin/admin-navigation";
import { SubmitButton } from "@/features/admin/submit-button";

import { isAdminAuthenticated } from "@/features/constancias/server/admin-auth";

import { ConfirmDeleteForm } from "@/features/files/client/confirm-delete-form";
import { UploadFileForm } from "@/features/files/client/upload-form";
import {
  createCategoryFromForm,
  deleteCategoryFromForm,
  deleteFileFromForm,
  loginArchivosAdmin,
  logoutArchivosAdmin,
  renameCategoryFromForm,
  renameFileFromForm,
  uploadFileFromForm,
} from "@/features/files/server/actions";
import { listCategoriesWithCounts, listFileAssetsPage } from "@/features/files/server/repository";

export const metadata = {
  title: "Admin archivos | ACyGP",
};

type AdminArchivosPageProps = {
  searchParams: Promise<{
    auth?: string;
    error?: string;
    uploaded?: string;
    fileRenamed?: string;
    fileDeleted?: string;
    categoryCreated?: string;
    categoryRenamed?: string;
    categoryDeleted?: string;
    page?: string;
    q?: string;
  }>;
};

export default async function AdminArchivosPage({ searchParams }: AdminArchivosPageProps) {
  const [isAuthenticated, query] = await Promise.all([isAdminAuthenticated(), searchParams]);

  if (!isAuthenticated) {
    return <LoginPanel authState={query.auth} />;
  }

  const [categories, filesResult] = await Promise.all([
    listCategoriesWithCounts(),
    listFileAssetsPage({ page: query.page, search: query.q }),
  ]);

  return (
    <main className="min-h-[calc(100vh-220px)] bg-slate-50 px-4 py-10 lg:px-24">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <AdminNavigation currentPath="/admin/archivos" />

        <div className="flex flex-col gap-4 rounded-2xl bg-main p-6 text-white shadow-lg md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Panel interno</p>
            <h1 className="mt-2 text-3xl font-bold">Archivos ACyGP</h1>
            <p className="mt-2 max-w-3xl text-white/80">
              Subí, organizá y gestioná los archivos internos por categoría.
            </p>
          </div>
          <form action={logoutArchivosAdmin}>
            <SubmitButton
              className="rounded-full border border-white/50 px-4 py-2 font-semibold text-white transition hover:bg-white hover:text-main"
              pendingLabel="Cerrando…"
            >
              Cerrar sesión
            </SubmitButton>
          </form>
        </div>

        <StatusMessage query={query} />

        <CategoriesSection categories={categories} />

        <section className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
          <section className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="text-2xl font-bold text-main">Subir archivo</h2>
            <p className="mt-2 text-sm text-slate-600">
              Máximo 4MB. Formatos permitidos: PDF, Word, PNG, JPG.
            </p>
            <div className="mt-6">
              <UploadFileForm categories={categories} action={uploadFileFromForm} />
            </div>
          </section>
          <FileListSection files={filesResult.items} pagination={filesResult.pagination} search={query.q} />
        </section>
      </section>
    </main>
  );
}

function LoginPanel({ authState }: { authState?: string }) {
  return (
    <main className="flex min-h-[calc(100vh-220px)] items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-main/70">Acceso interno</p>
        <h1 className="mt-2 text-3xl font-bold text-main">Admin archivos</h1>
        <p className="mt-3 text-slate-600">Ingresá la clave interna para gestionar archivos y categorías.</p>
        {authState === "invalid" && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            Clave incorrecta. Verificá ADMIN_PASSWORD.
          </p>
        )}
        <form action={loginArchivosAdmin} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Clave admin
            <input
              name="password"
              type="password"
              required
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-main focus:ring-2 focus:ring-main/20"
            />
          </label>
          <SubmitButton
            className="rounded-lg bg-main px-4 py-3 font-bold text-white transition hover:bg-blue-800"
            pendingLabel="Entrando…"
          >
            Entrar
          </SubmitButton>
        </form>
      </section>
    </main>
  );
}

function StatusMessage({ query }: { query: Awaited<AdminArchivosPageProps["searchParams"]> }) {
  if (query.uploaded) {
    return <SuccessBanner>Archivo &ldquo;{query.uploaded}&rdquo; subido correctamente.</SuccessBanner>;
  }

  if (query.fileRenamed) {
    return <SuccessBanner>Archivo renombrado correctamente.</SuccessBanner>;
  }

  if (query.fileDeleted) {
    return <SuccessBanner>Archivo eliminado correctamente.</SuccessBanner>;
  }

  if (query.categoryCreated) {
    return <SuccessBanner>Categoría creada correctamente.</SuccessBanner>;
  }

  if (query.categoryRenamed) {
    return <SuccessBanner>Categoría renombrada correctamente.</SuccessBanner>;
  }

  if (query.categoryDeleted) {
    return <SuccessBanner>Categoría eliminada correctamente.</SuccessBanner>;
  }

  if (query.error === "category-in-use") {
    return <ErrorBanner>No se puede eliminar: la categoría todavía tiene archivos asignados.</ErrorBanner>;
  }

  if (query.error === "file-too-large") {
    return <ErrorBanner>El archivo supera el tamaño máximo de 4MB.</ErrorBanner>;
  }

  if (query.error === "unsupported-type") {
    return <ErrorBanner>Formato no permitido. Usá PDF, Word, PNG o JPG.</ErrorBanner>;
  }

  if (query.error === "empty-name") {
    return <ErrorBanner>El archivo no tiene un nombre válido.</ErrorBanner>;
  }

  if (query.error === "invalid-data") {
    return <ErrorBanner>Datos inválidos. Revisá el formulario.</ErrorBanner>;
  }

  return null;
}

function SuccessBanner({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-800">
      {children}
    </p>
  );
}

function ErrorBanner({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-800">{children}</p>
  );
}

type CategoryWithCount = Awaited<ReturnType<typeof listCategoriesWithCounts>>[number];

function CategoriesSection({ categories }: { categories: CategoryWithCount[] }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-md">
      <h2 className="text-2xl font-bold text-main">Categorías</h2>
      <form action={createCategoryFromForm} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="new-category-name">
          Nueva categoría
        </label>
        <input
          id="new-category-name"
          name="name"
          required
          placeholder="Nombre de la categoría"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-main focus:ring-2 focus:ring-main/20"
        />
        <SubmitButton
          className="rounded-lg bg-main px-5 py-3 font-bold text-white transition hover:bg-blue-800"
          pendingLabel="Creando…"
        >
          Crear categoría
        </SubmitButton>
      </form>

      {categories.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">Todavía no hay categorías. Creá la primera arriba.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {categories.map((category) => (
            <CategoryRow key={category.id} category={category} />
          ))}
        </div>
      )}
    </section>
  );
}

function CategoryRow({ category }: { category: CategoryWithCount }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
      <form action={renameCategoryFromForm} className="flex min-w-0 flex-1 items-center gap-3">
        <input type="hidden" name="id" value={category.id} />
        <input
          name="name"
          defaultValue={category.name}
          required
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-main focus:ring-2 focus:ring-main/20"
        />
        <span className="whitespace-nowrap text-sm text-slate-500">{category._count.files} archivo(s)</span>
        <SubmitButton
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-main transition hover:bg-slate-50"
          pendingLabel="Guardando…"
        >
          Guardar
        </SubmitButton>
      </form>
      {category._count.files === 0 ? (
        <ConfirmDeleteForm
          triggerLabel="Eliminar"
          title="¿Eliminar categoría?"
          description={`Vas a eliminar la categoría "${category.name}". Esta acción no se puede deshacer.`}
          confirmLabel="Sí, eliminar"
          pendingLabel="Eliminando…"
          action={deleteCategoryFromForm}
          hiddenFields={{ id: category.id }}
        />
      ) : (
        <span
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-400"
          title="Reasigná o eliminá sus archivos primero"
        >
          No se puede eliminar
        </span>
      )}
    </div>
  );
}

type FilesPageResult = Awaited<ReturnType<typeof listFileAssetsPage>>;

function FileListSection({
  files,
  pagination,
  search,
}: {
  files: FilesPageResult["items"];
  pagination: FilesPageResult["pagination"];
  search?: string;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-md">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-main">Archivos</h2>
          <p className="mt-1 text-sm text-slate-500">
            Página {pagination.page} de {pagination.totalPages} · {pagination.totalItems} archivos
          </p>
        </div>
        <form method="get" action="/admin/archivos" className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="archivos-search">
            Buscar archivos
          </label>
          <input
            id="archivos-search"
            name="q"
            defaultValue={search ?? ""}
            placeholder="Buscar por nombre o categoría"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-main focus:ring-2 focus:ring-main/20"
          />
          <button className="rounded-lg bg-main px-5 py-3 font-bold text-white transition hover:bg-blue-800">
            Buscar
          </button>
          {search && (
            <Link
              href="/admin/archivos"
              className="rounded-lg border border-slate-300 px-5 py-3 text-center font-bold text-main transition hover:bg-slate-50"
            >
              Limpiar
            </Link>
          )}
        </form>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {files.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
            <h3 className="font-bold text-slate-900">
              {search ? "No encontramos archivos" : "Todavía no hay archivos"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {search
                ? "Probá con otro nombre o categoría, o limpiá la búsqueda."
                : "Subí el primero desde el formulario de arriba."}
            </p>
          </div>
        ) : (
          files.map((file) => <FileRow key={file.id} file={file} />)
        )}
      </div>

      <PaginationControls pagination={pagination} search={search} />
    </section>
  );
}

function FileRow({ file }: { file: FilesPageResult["items"][number] }) {
  return (
    <article className="grid gap-3 rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{file.name}</h3>
          <p className="text-sm text-slate-500">
            {file.category.name} · {formatFileSize(file.size)} · {formatDate(file.createdAt)}
          </p>
        </div>
        <a href={file.blobUrl} target="_blank" rel="noreferrer" className="font-bold text-main hover:underline">
          Descargar
        </a>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form action={renameFileFromForm} className="flex min-w-0 flex-1 items-center gap-3">
          <input type="hidden" name="id" value={file.id} />
          <input
            name="name"
            defaultValue={file.name}
            required
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-main focus:ring-2 focus:ring-main/20"
          />
          <SubmitButton
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-main transition hover:bg-slate-50"
            pendingLabel="Guardando…"
          >
            Renombrar
          </SubmitButton>
        </form>
        <ConfirmDeleteForm
          triggerLabel="Eliminar"
          title="¿Eliminar archivo?"
          description={`Vas a eliminar "${file.name}". Esta acción no se puede deshacer.`}
          confirmLabel="Sí, eliminar"
          pendingLabel="Eliminando…"
          action={deleteFileFromForm}
          hiddenFields={{ id: file.id }}
        />
      </div>
    </article>
  );
}

function PaginationControls({
  pagination,
  search,
}: {
  pagination: FilesPageResult["pagination"];
  search?: string;
}) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  const previousHref = buildArchivosPageHref({ page: pagination.page - 1, search });
  const nextHref = buildArchivosPageHref({ page: pagination.page + 1, search });

  return (
    <nav
      className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5"
      aria-label="Paginación de archivos"
    >
      <Link
        href={previousHref}
        aria-disabled={!pagination.hasPreviousPage}
        className={`rounded-lg border px-4 py-2 font-bold transition ${pagination.hasPreviousPage ? "border-slate-300 text-main hover:bg-slate-50" : "pointer-events-none border-slate-200 text-slate-300"}`}
      >
        Anterior
      </Link>
      <span className="text-sm font-semibold text-slate-600">
        {pagination.page} / {pagination.totalPages}
      </span>
      <Link
        href={nextHref}
        aria-disabled={!pagination.hasNextPage}
        className={`rounded-lg border px-4 py-2 font-bold transition ${pagination.hasNextPage ? "border-slate-300 text-main hover:bg-slate-50" : "pointer-events-none border-slate-200 text-slate-300"}`}
      >
        Siguiente
      </Link>
    </nav>
  );
}

function buildArchivosPageHref({ page, search }: { page: number; search?: string }) {
  const params = new URLSearchParams({ page: String(page) });

  if (search) {
    params.set("q", search);
  }

  return `/admin/archivos?${params.toString()}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeZone: "UTC" }).format(date);
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
```

- [ ] **Step 4: Type-check and run the full suite**

Run: `npx tsc --noEmit && npm run test && npm run lint`
Expected: no type errors, all tests pass, no lint errors.

- [ ] **Step 5: Manual verification with the dev server**

Run: `npm run dev` (in the background), then in a browser visit `/admin/archivos`:
1. Log in with `ADMIN_PASSWORD`.
2. Create a category, confirm it appears with "0 archivo(s)" and its delete button is enabled.
3. Upload a small PDF/PNG under 4MB, either picking that category or typing a brand-new category name — confirm it appears in the file list with a working "Descargar" link (requires `BLOB_READ_WRITE_TOKEN` to be set — if it isn't, note that as a follow-up rather than blocking this task).
4. Confirm the category now shows "1 archivo(s)" and its delete button is replaced by "No se puede eliminar".
5. Rename the file and the category inline; confirm both updates persist after reload.
6. Delete the file, confirm the category's delete button becomes enabled again, then delete the category.
7. Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/archivos
git commit -m "feat: add admin archivos page"
```
