// FILE: src/lib/auth.ts

import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export const SESSION_COOKIE_NAME = "myshop_session";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export type UserRole =
  | "USER"
  | "ADMIN"
  | "DEVELOPER";

export interface SessionPayload extends JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET must be configured and at least 32 characters long."
    );
  }

  return new TextEncoder().encode(secret);
}

export async function createSessionToken(data: {
  userId: string;
  email: string;
  role: UserRole;
}) {
  return new SignJWT({
    userId: data.userId,
    email: data.email,
    role: data.role,
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get(
      SESSION_COOKIE_NAME
    )?.value;

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(
      token,
      getJwtSecret(),
      {
        algorithms: ["HS256"],
      }
    );

    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string"
    ) {
      return null;
    }

    if (
      payload.role !== "USER" &&
      payload.role !== "ADMIN" &&
      payload.role !== "DEVELOPER"
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      exp: payload.exp,
      iat: payload.iat,
    };
  } catch {
    return null;
  }
}