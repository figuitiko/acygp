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
        {authState === "required" && (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            Tu sesión expiró. Ingresá de nuevo.
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

  if (query.error === "category-exists") {
    return <ErrorBanner>Ya existe una categoría con ese nombre.</ErrorBanner>;
  }

  if (query.error === "upload-failed") {
    return <ErrorBanner>No pudimos subir el archivo. Intentá de nuevo.</ErrorBanner>;
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
