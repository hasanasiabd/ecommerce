// src/lib/auth.ts

import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export interface SessionPayload {
  userId: string;
  email: string;
  role: "USER" | "ADMIN" | "DEVELOPER";
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("myshop_session")?.value;

  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}