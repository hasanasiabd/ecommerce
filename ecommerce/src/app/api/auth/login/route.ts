// FILE: src/app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { createSessionToken } from "@/lib/auth";
import {
  createOtp,
} from "@/lib/otp";
import {
  sendOtpEmail,
} from "@/lib/resend";

function setSessionCookie(
  response: NextResponse,
  token: string
) {
  response.cookies.set({
    name: "myshop_session",
    value: token,
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

function getPanelPath(
  envName: string
) {
  const value =
    process.env[envName]?.trim();

  if (!value) {
    throw new Error(
      `${envName} is not configured.`
    );
  }

  return value.startsWith("/")
    ? value
    : `/${value}`;
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const identity =
      typeof body.identity === "string"
        ? body.identity.trim()
        : typeof body.email === "string"
          ? body.email.trim()
          : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (!identity || !password) {
      return NextResponse.json(
        {
          error:
            "Username/email and password are required.",
        },
        { status: 400 }
      );
    }

    const normalizedIdentity =
      identity.toLowerCase();

    /*
     * ========================================================
     * DEVELOPER LOGIN
     * ========================================================
     */

    const developerEmail =
      process.env.MASTER_DEV_EMAIL
        ?.trim()
        .toLowerCase();

    const developerPassword =
      process.env.MASTER_DEV_PASSWORD;

    const developerUsername =
      process.env.DEV_USERNAME
        ?.trim()
        .toLowerCase();

    const isDeveloperLogin =
      Boolean(
        developerEmail &&
        developerPassword
      ) &&
      (
        normalizedIdentity ===
          developerEmail ||
        normalizedIdentity ===
          developerUsername
      ) &&
      password ===
        developerPassword;

    if (isDeveloperLogin) {
      const { code } =
        await createOtp({
          email:
            developerEmail!,
          purpose:
            "DEVELOPER_LOGIN",
        });

      await sendOtpEmail(
        developerEmail!,
        code,
        "DEVELOPER_LOGIN"
      );

      return NextResponse.json({
        success: true,
        requireOtp: true,
        purpose:
          "DEVELOPER_LOGIN",
        email:
          developerEmail,
      });
    }

    /*
     * ========================================================
     * DATABASE USER / ADMIN LOGIN
     * ========================================================
     */

    const user =
      await db.user.findFirst({
        where: {
          OR: [
            {
              email:
                normalizedIdentity,
            },
            {
              username:
                normalizedIdentity,
            },
          ],
        },
      });

    if (!user || !user.password) {
      return NextResponse.json(
        {
          error:
            "Invalid username/email or password.",
        },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        {
          error:
            "This account has been disabled.",
        },
        { status: 403 }
      );
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!validPassword) {
      return NextResponse.json(
        {
          error:
            "Invalid username/email or password.",
        },
        { status: 401 }
      );
    }

    const token =
      await createSessionToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

    const redirectPath =
      user.role === "ADMIN"
        ? getPanelPath(
            "ADMIN_PANEL_PATH"
          )
        : "/dashboard";

    const response =
      NextResponse.json({
        success: true,
        message:
          "Login successful.",
        redirectPath,
        user: {
          id: user.id,
          username:
            user.username,
          name:
            user.name,
          email:
            user.email,
          role:
            user.role,
        },
      });

    setSessionCookie(
      response,
      token
    );

    return response;
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to login.",
      },
      { status: 500 }
    );
  }
}