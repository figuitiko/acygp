# Admin file library (Vercel Blob) — design

## Purpose

Add an admin-only file library: admins upload files (small docs, <4MB — PDF/docx/images), organize them into categories, and manage both via CRUD. Admin-only for now — no public page consumes these files yet.

## Architecture

New feature module `src/features/files/`, mirroring the existing `src/features/constancias/` structure and conventions (server actions with native `<form action={...}>`, cookie session auth, zod validation, `revalidatePath` + redirect-with-query-param for status messages — no client-side fetch/JSON API layer).

```
src/features/files/
  domain/
    file.ts            # filename/size/content-type validation helpers
    file.test.ts
  server/
    repository.ts       # prisma CRUD for FileCategory + FileAsset
    actions.ts           # "use server" — upload/rename/delete file & category actions
  client/
    upload-form.tsx       # "use client" — category <select> + inline "nueva categoría" toggle
    delete-file-form.tsx    # confirm-dialog pattern (mirrors revoke-confirmation-form.tsx)
    delete-category-form.tsx
```

Route: `src/app/admin/archivos/page.tsx`. Added to `ADMIN_NAVIGATION_ITEMS` in `src/features/admin/navigation.ts` (`{ label: "Archivos", href: "/admin/archivos" }`).

Auth: reuses existing `isAdminAuthenticated()` / `loginAdmin` / `logoutAdmin` from `src/features/constancias/server/admin-auth.ts` (cookie is scoped to path `/admin`, shared across all admin routes already — no new auth code needed).

Pagination/search: reuses `createPagination` from `src/features/constancias/domain/pagination.ts` as-is (already generic, no constancia-specific logic) for the file list, with a `q` search param same as `/admin/constancias`.

## Data model

`prisma/schema.prisma` additions:

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
  blobPathname String       // stored so delete() can target the exact blob
  contentType  String
  size         Int
  categoryId   String
  category     FileCategory @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  createdAt    DateTime     @default(now())

  @@index([categoryId])
}
```

`onDelete: Restrict` blocks category deletion at the DB level while files reference it — the repository surfaces the resulting Prisma `P2003` error as a friendly redirect rather than reimplementing the check in application code.

## Upload flow / server actions (`server/actions.ts`)

Same shape as `createConstanciaFromForm`: auth check → zod validate → mutate → `revalidatePath` → `redirect` with a status query param.

- `uploadFileFromForm(formData)` — fields: `file` (File), and either `categoryId` (existing category) or `newCategoryName` (create inline). Validates via zod, calls `@vercel/blob`'s `put(pathname, file, { access: "public" })`, then `createFileAsset()` in the repository. When `newCategoryName` is present, category creation + file creation run inside one `prisma.$transaction`.
- `renameFileFromForm(formData)` — `id` + `name`, no re-upload.
- `deleteFileFromForm(formData)` — calls Blob `del(blobPathname)`, then deletes the row. A Blob delete failure is logged but does not block the row delete (an orphaned blob is harmless; a stuck DB row blocks the admin).
- `createCategoryFromForm(formData)` — `name`, unique-constraint violation → `?error=category-exists`.
- `renameCategoryFromForm(formData)` — `id` + `name`.
- `deleteCategoryFromForm(formData)` — `id`; catches Prisma `P2003` → `?error=category-in-use`.

## UI — `/admin/archivos`, single page, two sections

1. **Categories** — small table: name, file count, inline rename form, delete button (disabled/tooltipped client-side when file count > 0, so the FK-restrict error is the fallback, not the primary UX).
2. **Upload + file list** — upload form: native `<input type="file">`, a `<select>` of existing categories plus a "+ Nueva categoría" text input revealed via `useState` toggle (same interaction shape as `revoke-confirmation-form.tsx`'s modal toggle). Below it, the paginated/searchable file list: name, category, size, a direct download link (the public Blob URL), delete button.

## Error handling

Follows `/admin/constancias`'s existing convention exactly: `page.tsx` inline-checks `query.error === "<code>"` and renders a small red banner `<p>`, no shared error-message lookup module. Codes: `invalid-data`, `category-exists`, `category-in-use`, `upload-failed`.

## Env / dependencies

- New dependency: `@vercel/blob`.
- New env var: `BLOB_READ_WRITE_TOKEN`, added to `.env.example`.

## Testing (Strict TDD)

Domain unit tests (`file.test.ts`) for filename/size/content-type validation, following the existing `constancia.test.ts` / `pagination.test.ts` style. No action/repository-level tests, matching the existing precedent — `constancias`' server actions and repository are untested at that layer too; only pure domain logic gets unit tests in this codebase.

## Out of scope (YAGNI)

- No public-facing page/consumption of these files (admin-only per explicit requirement).
- No client-direct-to-Blob multipart upload (files are confirmed small, so a plain server action upload is sufficient — no need for the `@vercel/blob/client` `handleUpload` route).
- No hierarchical categories, no file descriptions, no versioning.
