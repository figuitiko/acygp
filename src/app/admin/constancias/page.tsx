import Image from "next/image";
import Link from "next/link";

import {
  createConstanciaFromForm,
  createQrCodeDataUrl,
  loginAdmin,
  logoutAdmin,
  revokeConstanciaFromForm,
} from "@/features/constancias/server/actions";
import { isAdminAuthenticated } from "@/features/constancias/server/admin-auth";
import { getConstanciaByFolio, listConstancias } from "@/features/constancias/server/repository";
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
    revoked?: string;
    validateFolio?: string;
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
  const [constancias, siteUrl, lookupConstancia] = await Promise.all([
    listConstancias(),
    getSiteUrl(),
    normalizedLookupFolio ? getConstanciaByFolio(normalizedLookupFolio) : Promise.resolve(null),
  ]);
  const constanciasWithQr = await Promise.all(
    constancias.map(async (constancia) => {
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
          <ConstanciaList constancias={constanciasWithQr} />
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

type ConstanciaListItem = Awaited<ReturnType<typeof listConstancias>>[number] & {
  validationUrl: string;
  qrCodeDataUrl: string;
};

function ConstanciaList({ constancias }: { constancias: ConstanciaListItem[] }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-md">
      <h2 className="text-2xl font-bold text-main">Últimas constancias</h2>
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
                </div>
                {constancia.status === "VALID" && (
                  <form action={revokeConstanciaFromForm} className="mt-4">
                    <input type="hidden" name="id" value={constancia.id} />
                    <button className="rounded-lg border border-red-200 px-3 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50">
                      Revocar
                    </button>
                  </form>
                )}
              </div>
              <Image src={constancia.qrCodeDataUrl} alt={`QR de validación ${constancia.folio}`} width={180} height={180} unoptimized className="rounded-lg border border-slate-200" />
            </article>
          ))
        )}
      </div>
    </section>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeZone: "UTC" }).format(date);
}
