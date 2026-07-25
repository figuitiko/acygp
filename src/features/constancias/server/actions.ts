"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { z } from "zod";

import {
  clearAdminSessionCookie,
  isAdminAuthenticated,
  isValidAdminPassword,
  setAdminSessionCookie,
} from "./admin-auth";
import { createConstancia, revokeConstancia } from "./repository";
import { getSiteUrl } from "./site-url";

const createConstanciaSchema = z.object({
  recipientName: z.string().trim().min(1, "El nombre es obligatorio"),
  courseName: z.string().trim().min(1, "El curso o estándar es obligatorio"),
  standardCode: z.string().trim().optional(),
  issuedAt: z.string().min(1, "La fecha de emisión es obligatoria"),
});

export async function loginAdmin(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!isValidAdminPassword(password)) {
    redirect("/admin/constancias?auth=invalid");
  }

  await setAdminSessionCookie();
  redirect("/admin/constancias");
}

export async function logoutAdmin() {
  await clearAdminSessionCookie();
  redirect("/admin/constancias");
}

export async function createConstanciaFromForm(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/constancias?auth=required");
  }

  const result = createConstanciaSchema.safeParse({
    recipientName: formData.get("recipientName"),
    courseName: formData.get("courseName"),
    standardCode: formData.get("standardCode"),
    issuedAt: formData.get("issuedAt"),
  });

  if (!result.success) {
    redirect("/admin/constancias?error=invalid-data");
  }

  const constancia = await createConstancia({
    recipientName: result.data.recipientName,
    courseName: result.data.courseName,
    standardCode: result.data.standardCode || null,
    issuedAt: parseDateOnly(result.data.issuedAt),
    siteUrl: await getSiteUrl(),
  });

  revalidatePath("/admin/constancias");
  redirect(`/admin/constancias?created=${encodeURIComponent(constancia.folio)}`);
}

export async function revokeConstanciaFromForm(formData: FormData) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/constancias?auth=required");
  }

  const id = String(formData.get("id") ?? "");

  if (id) {
    await revokeConstancia(id);
  }

  revalidatePath("/admin/constancias");
  redirect("/admin/constancias?revoked=1");
}

export async function createQrCodeDataUrl(validationUrl: string) {
  return QRCode.toDataURL(validationUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 180,
  });
}

function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}
