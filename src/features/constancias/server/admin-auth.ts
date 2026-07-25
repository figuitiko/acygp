import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "acygp_admin_session";
const ONE_DAY_IN_SECONDS = 60 * 60 * 24;

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  return Boolean(cookieValue && safeEqual(cookieValue, createAdminSessionValue()));
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, createAdminSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: ONE_DAY_IN_SECONDS,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 0,
  });
}

export function isValidAdminPassword(password: string) {
  const configuredPassword = process.env.ADMIN_PASSWORD;

  if (!configuredPassword) {
    throw new Error("ADMIN_PASSWORD is required for constancia admin access");
  }

  return safeEqual(password, configuredPassword);
}

function createAdminSessionValue() {
  const configuredPassword = process.env.ADMIN_PASSWORD;

  if (!configuredPassword) {
    throw new Error("ADMIN_PASSWORD is required for constancia admin access");
  }

  return createHmac("sha256", configuredPassword)
    .update("acygp-admin-session-v1")
    .digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
