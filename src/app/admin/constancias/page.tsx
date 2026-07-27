import Image from "next/image";
import Link from "next/link";

import { AdminNavigation } from "@/features/admin/admin-navigation";

import {
  createConstanciaFromForm,
  createQrCodeDataUrl,
  loginAdmin,
  logoutAdmin,
  reactivateConstanciaFromForm,
  revokeConstanciaFromForm,
} from "@/features/constancias/server/actions";
import { RevokeConfirmationForm } from "@/features/constancias/client/revoke-confirmation-form";
import { isAdminAuthenticated } from "@/features/constancias/server/admin-auth";
import { getConstanciaByFolio, listConstanciasPage } from "@/features/constancias/server/repository";
import { getSiteUrl } from "@/features/constancias/server/site-url";
import {
  buildConstanciaValidationUrl,
  normalizeConstanciaFolioInput,
} from "@/features/constancias/domain/constancia";

export const metadata = {
  title: "Admin constancias | ACyGP",
};

type AdminConstanciasPageProps = {
  searchParams: Promise<{
    auth?: string;
    created?: string;
    error?: string;
    reactivated?: string;
    revoked?: string;
    updated?: string;
    validateFolio?: string;
    page?: string;
    q?: string;
  }>;
};

export default async function AdminConstanciasPage({ searchParams }: AdminConstanciasPageProps) {
  const [isAuthenticated, query] = await Promise.all([
    isAdminAuthenticated(),
    searchParams,
  ]);

  if (!isAuthenticated) {
    return <LoginPanel authState={query.auth} />;
  }

  const normalizedLookupFolio = query.validateFolio
    ? normalizeConstanciaFolioInput(query.validateFolio)
    : null;
  const [constanciasResult, siteUrl, lookupConstancia] = await Promise.all([
    listConstanciasPage({ page: query.page, search: query.q }),
    getSiteUrl(),
    normalizedLookupFolio ? getConstanciaByFolio(normalizedLookupFolio) : Promise.resolve(null),
  ]);
  const constanciasWithQr = await Promise.all(
    constanciasResult.items.map(async (constancia) => {
      const validationUrl = buildConstanciaValidationUrl({
        baseUrl: siteUrl,
        folio: constancia.folio,
      });

      return {
        ...constancia,
        validationUrl,
        qrCodeDataUrl: await createQrCodeDataUrl(validationUrl),
      };
    })
  );

  return (
    <main className="min-h-[calc(100vh-220px)] bg-slate-50 px-4 py-10 lg:px-24">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">
        <AdminNavigation currentPath="/admin/constancias" />

        <div className="flex flex-col gap-4 rounded-2xl bg-main p-6 text-white shadow-lg md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">Panel interno</p>
            <h1 className="mt-2 text-3xl font-bold">Constancias ACyGP</h1>
            <p className="mt-2 max-w-3xl text-white/80">
              Emití folios, guardá el hash de validación y generá el QR público. Esto valida documentos emitidos por ACyGP; no reemplaza RENAP ni certificados oficiales de CONOCER.
            </p>
          </div>
          <form action={logoutAdmin}>
            <button className="rounded-full border border-white/50 px-4 py-2 font-semibold text-white transition hover:bg-white hover:text-main">
              Cerrar sesión
            </button>
          </form>
        </div>

        <StatusMessage query={query} />

        <AdminValidationLookup
          lookupFolio={normalizedLookupFolio}
          constancia={lookupConstancia}
          siteUrl={siteUrl}
        />

        <section className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
          <CreateConstanciaForm />
          <ConstanciaList
            constancias={constanciasWithQr}
            pagination={constanciasResult.pagination}
            search={query.q}
          />
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
        <h1 className="mt-2 text-3xl font-bold text-main">Admin constancias</h1>
        <p className="mt-3 text-slate-600">
          Ingresá la clave interna para crear y revocar constancias ACyGP.
        </p>
        {authState === "invalid" && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            Clave incorrecta. Verificá ADMIN_PASSWORD.
          </p>
        )}
        <form action={loginAdmin} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Clave admin
            <input
              name="password"
              type="password"
              required
              className="rounded-lg border border-slate-300 px-4 py-3 text-base outline-none transition focus:border-main focus:ring-2 focus:ring-main/20"
            />
          </label>
          <button className="rounded-lg bg-main px-4 py-3 font-bold text-white transition hover:bg-blue-800">
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}

function StatusMessage({ query }: { query: Awaited<AdminConstanciasPageProps["searchParams"]> }) {
  if (query.created) {
    return (
      <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-800">
        Constancia creada con folio {query.created}.
      </p>
    );
  }

  if (query.updated) {
    return (
      <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-800">
        Constancia {query.updated} actualizada correctamente.
      </p>
    );
  }

  if (query.reactivated) {
    return (
      <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 font-semibold text-emerald-800">
        Constancia reactivada correctamente.
      </p>
    );
  }

  if (query.revoked) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 font-semibold text-amber-800">
        Constancia revocada correctamente.
      </p>
    );
  }

  if (query.error === "invalid-data") {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-semibold text-red-800">
        Datos inválidos. Revisá nombre, curso y fecha.
      </p>
    );
  }

  return null;
}


function AdminValidationLookup({
  lookupFolio,
  constancia,
  siteUrl,
}: {
  lookupFolio: string | null;
  constancia: Awaited<ReturnType<typeof getConstanciaByFolio>>;
  siteUrl: string;
}) {
  const validationUrl = lookupFolio
    ? buildConstanciaValidationUrl({ baseUrl: siteUrl, folio: lookupFolio })
    : null;

  return (
    <section className="rounded-2xl bg-white p-6 shadow-md">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
        <div>
          <h2 className="text-2xl font-bold text-main">Validar por folio</h2>
          <p className="mt-2 text-sm text-slate-600">
            Ingresá cualquier folio ACyGP para consultar si existe, si está vigente o si fue revocado.
          </p>
          <form method="get" action="/admin/constancias" className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              name="validateFolio"
              placeholder="ACyGP-2026-000001"
              defaultValue={lookupFolio ?? ""}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-main focus:ring-2 focus:ring-main/20"
            />
            <button className="rounded-lg bg-main px-5 py-3 font-bold text-white transition hover:bg-blue-800">
              Validar
            </button>
          </form>
        </div>

        {lookupFolio && (
          <div className={`rounded-xl border p-5 ${constancia ? constancia.status === "VALID" ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Resultado</p>
            {constancia ? (
              <div className="mt-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-xl font-bold text-slate-900">{constancia.folio}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${constancia.status === "VALID" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                    {constancia.status === "VALID" ? "Válida" : "Revocada"}
                  </span>
                </div>
                <p className="mt-2 font-semibold text-slate-800">{constancia.recipientName}</p>
                <p className="text-slate-600">{constancia.courseName}</p>
                <div className="mt-4 flex flex-wrap gap-4">
                  {validationUrl && (
                    <Link href={validationUrl} className="font-bold text-main hover:underline">
                      Abrir validación pública
                    </Link>
                  )}
                  <Link href={`/admin/constancias/${encodeURIComponent(constancia.folio)}/qr`} className="font-bold text-main hover:underline">
                    Ver QR grande
                  </Link>
                </div>
              </div>
            ) : (
              <p className="mt-3 font-semibold text-amber-800">
                No existe una constancia con el folio {lookupFolio}.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function CreateConstanciaForm() {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-md">
      <h2 className="text-2xl font-bold text-main">Nueva constancia</h2>
      <p className="mt-2 text-sm text-slate-600">
        El sistema genera el folio, el hash y la URL del QR automáticamente.
      </p>
      <form action={createConstanciaFromForm} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
          Nombre de la persona
          <input name="recipientName" required className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-main focus:ring-2 focus:ring-main/20" />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
          Curso o estándar
          <input name="courseName" required className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-main focus:ring-2 focus:ring-main/20" />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
          Código de estándar, si aplica
          <input name="standardCode" placeholder="Ej. EC0217.01" className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-main focus:ring-2 focus:ring-main/20" />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
          Fecha de emisión
          <input name="issuedAt" type="date" required className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-main focus:ring-2 focus:ring-main/20" />
        </label>
        <button className="rounded-lg bg-main px-4 py-3 font-bold text-white transition hover:bg-blue-800">
          Crear constancia
        </button>
      </form>
    </section>
  );
}

type ConstanciasPageResult = Awaited<ReturnType<typeof listConstanciasPage>>;

type ConstanciaListItem = ConstanciasPageResult["items"][number] & {
  validationUrl: string;
  qrCodeDataUrl: string;
};

function ConstanciaList({
  constancias,
  pagination,
  search,
}: {
  constancias: ConstanciaListItem[];
  pagination: ConstanciasPageResult["pagination"];
  search?: string;
}) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-md">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-main">Últimas constancias</h2>
          <p className="mt-1 text-sm text-slate-500">
            Página {pagination.page} de {pagination.totalPages} · {pagination.totalItems} constancias
          </p>
        </div>
        <form method="get" action="/admin/constancias" className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="constancias-search">Buscar constancias</label>
          <input
            id="constancias-search"
            name="q"
            defaultValue={search ?? ""}
            placeholder="Buscar por folio, nombre, curso o estándar"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-main focus:ring-2 focus:ring-main/20"
          />
          <button className="rounded-lg bg-main px-5 py-3 font-bold text-white transition hover:bg-blue-800">
            Buscar
          </button>
          {search && (
            <Link href="/admin/constancias" className="rounded-lg border border-slate-300 px-5 py-3 text-center font-bold text-main transition hover:bg-slate-50">
              Limpiar
            </Link>
          )}
        </form>
      </div>
      <div className="mt-6 flex flex-col gap-4">
        {constancias.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
            Todavía no hay constancias emitidas.
          </p>
        ) : (
          constancias.map((constancia) => (
            <article key={constancia.id} className="grid gap-4 rounded-xl border border-slate-200 p-4 md:grid-cols-[1fr_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900">{constancia.folio}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${constancia.status === "VALID" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                    {constancia.status === "VALID" ? "Válida" : "Revocada"}
                  </span>
                </div>
                <p className="mt-2 font-semibold text-slate-800">{constancia.recipientName}</p>
                <p className="text-slate-600">{constancia.courseName}</p>
                {constancia.standardCode && <p className="text-sm text-slate-500">Estándar: {constancia.standardCode}</p>}
                <p className="mt-2 text-sm text-slate-500">Emitida: {formatDate(constancia.issuedAt)}</p>
                <p className="mt-2 break-all text-xs text-slate-500">Hash: {constancia.validationHash}</p>
                <div className="mt-3 flex flex-wrap gap-4">
                  <Link href={constancia.validationUrl} className="inline-flex font-bold text-main hover:underline">
                    Abrir validación pública
                  </Link>
                  <Link href={`/admin/constancias/${encodeURIComponent(constancia.folio)}/qr`} className="inline-flex font-bold text-main hover:underline">
                    Ver QR grande
                  </Link>
                  <Link href={`/admin/constancias/${encodeURIComponent(constancia.folio)}/editar`} className="inline-flex font-bold text-main hover:underline">
                    Editar
                  </Link>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {constancia.status === "VALID" ? (
                    <RevokeConfirmationForm
                      constanciaId={constancia.id}
                      folio={constancia.folio}
                      recipientName={constancia.recipientName}
                      action={revokeConstanciaFromForm}
                    />
                  ) : (
                    <form action={reactivateConstanciaFromForm}>
                      <input type="hidden" name="id" value={constancia.id} />
                      <button className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50">
                        Reactivar
                      </button>
                    </form>
                  )}
                </div>
              </div>
              <Image src={constancia.qrCodeDataUrl} alt={`QR de validación ${constancia.folio}`} width={180} height={180} unoptimized className="rounded-lg border border-slate-200" />
            </article>
          ))
        )}
      </div>
      <PaginationControls pagination={pagination} search={search} />
    </section>
  );
}

function PaginationControls({
  pagination,
  search,
}: {
  pagination: ConstanciasPageResult["pagination"];
  search?: string;
}) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  const previousHref = buildConstanciasPageHref({ page: pagination.page - 1, search });
  const nextHref = buildConstanciasPageHref({ page: pagination.page + 1, search });

  return (
    <nav className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5" aria-label="Paginación de constancias">
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

function buildConstanciasPageHref({ page, search }: { page: number; search?: string }) {
  const params = new URLSearchParams({ page: String(page) });

  if (search) {
    params.set("q", search);
  }

  return `/admin/constancias?${params.toString()}`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeZone: "UTC" }).format(date);
}
