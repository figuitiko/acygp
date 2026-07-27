import Image from "next/image";
import Link from "next/link";

import { AdminNavigation } from "@/features/admin/admin-navigation";
import { redirect } from "next/navigation";

import { buildConstanciaValidationUrl } from "@/features/constancias/domain/constancia";
import { createLargeQrCodeDataUrl } from "@/features/constancias/server/actions";
import { isAdminAuthenticated } from "@/features/constancias/server/admin-auth";
import { getConstanciaByFolio } from "@/features/constancias/server/repository";
import { getSiteUrl } from "@/features/constancias/server/site-url";

export const metadata = {
  title: "QR constancia | ACyGP",
};

type AdminConstanciaQrPageProps = {
  params: Promise<{ folio: string }>;
};

export default async function AdminConstanciaQrPage({ params }: AdminConstanciaQrPageProps) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/constancias?auth=required");
  }

  const { folio } = await params;
  const decodedFolio = decodeURIComponent(folio);
  const [constancia, siteUrl] = await Promise.all([
    getConstanciaByFolio(decodedFolio),
    getSiteUrl(),
  ]);

  if (!constancia) {
    return (
      <main className="min-h-[calc(100vh-220px)] bg-slate-50 px-4 py-10 lg:px-24">
        <section className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-main">QR no encontrado</h1>
          <p className="mt-3 text-slate-600">No existe una constancia con el folio {decodedFolio}.</p>
          <Link href="/admin/constancias" className="mt-6 inline-flex font-bold text-main hover:underline">
            Volver al admin
          </Link>
        </section>
      </main>
    );
  }

  const validationUrl = buildConstanciaValidationUrl({ baseUrl: siteUrl, folio: constancia.folio });
  const qrCodeDataUrl = await createLargeQrCodeDataUrl(validationUrl);

  return (
    <main className="min-h-[calc(100vh-220px)] bg-slate-50 px-4 py-10 lg:px-24">
      <section className="mx-auto flex max-w-4xl flex-col gap-6">
        <AdminNavigation currentPath="/admin/constancias" />

        <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-main/70">QR de validación</p>
        <h1 className="mt-2 text-3xl font-bold text-main">{constancia.folio}</h1>
        <p className="mt-2 text-slate-600">{constancia.recipientName} · {constancia.courseName}</p>
        <div className="mt-8 flex justify-center">
          <Image
            src={qrCodeDataUrl}
            alt={`QR de validación ${constancia.folio}`}
            width={640}
            height={640}
            unoptimized
            className="w-full max-w-[640px] rounded-2xl border border-slate-200"
          />
        </div>
        <p className="mx-auto mt-6 max-w-2xl break-all rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          {validationUrl}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Link href={validationUrl} className="rounded-lg bg-main px-5 py-3 font-bold text-white transition hover:bg-blue-800">
            Abrir validación pública
          </Link>
          <Link href="/admin/constancias" className="rounded-lg border border-slate-300 px-5 py-3 font-bold text-main transition hover:bg-slate-50">
            Volver al admin
          </Link>
        </div>
        </div>
      </section>
    </main>
  );
}
