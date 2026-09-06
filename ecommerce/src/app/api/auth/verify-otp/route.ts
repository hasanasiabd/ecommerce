// FILE: src/app/api/auth/verify-otp/route.ts

import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { createSessionToken } from "@/lib/auth";
import { verifyOtp } from "@/lib/otp";

function setSessionCookie(
  response: NextResponse,
  token: string
) {
  response.cookies.set({
    name: "myshop_session",
    value: token,
    httpOnly: true,
    secure:
      process.env.NODE_ENV ===
      "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const email =
      typeof body.email === "string"
        ? body.email
            .trim()
            .toLowerCase()
        : "";

    const code =
      typeof body.code === "string"
        ? body.code.trim()
        : "";

    const purpose =
      body.purpose ===
      "DEVELOPER_LOGIN"
        ? "DEVELOPER_LOGIN"
        : "REGISTRATION";

    if (!email || !code) {
      return NextResponse.json(
        {
          error:
            "Email and OTP code are required.",
        },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        {
          error:
            "OTP must contain exactly 6 digits.",
        },
        { status: 400 }
      );
    }

    /*
     * ========================================================
     * DEVELOPER OTP
     * ========================================================
     */

    if (
      purpose === "DEVELOPER_LOGIN"
    ) {
      const developerEmail =
        process.env.MASTER_DEV_EMAIL
          ?.trim()
          .toLowerCase();

      if (
        !developerEmail ||
        email !== developerEmail
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid developer verification request.",
          },
          { status: 403 }
        );
      }

      const result =
        await verifyOtp({
          email,
          code,
          purpose:
            "DEVELOPER_LOGIN",
        });

      if (!result.success) {
        return NextResponse.json(
          {
            error:
              result.error,
          },
          { status: 400 }
        );
      }

      const developerUsername =
        process.env.DEV_USERNAME?.trim().toLowerCase() ||
        undefined;

      const developer =
        await db.user.upsert({
          where: {
            email:
              developerEmail,
          },
          create: {
            ...(developerUsername
              ? { username: developerUsername }
              : {}),
            email:
              developerEmail,
            name: "Developer",
            role:
              "DEVELOPER",
            isActive: true,
          },
          update: {
            role:
              "DEVELOPER",
            isActive: true,
          },
        });

      const token =
        await createSessionToken({
          userId:
            developer.id,
          email:
            developer.email,
          role:
            "DEVELOPER",
        });

      const response =
        NextResponse.json({
          success: true,
          message:
            "Developer authentication successful.",
          user: {
            id:
              developer.id,
            username:
              developer.username,
            name:
              developer.name,
            email:
              developer.email,
            role:
              developer.role,
          },
        });

      setSessionCookie(
        response,
        token
      );

      return response;
    }

    /*
     * ========================================================
     * CUSTOMER REGISTRATION OTP
     * ========================================================
     */

    const result =
      await verifyOtp({
        email,
        code,
        purpose:
          "REGISTRATION",
      });

    if (!result.success) {
      return NextResponse.json(
        {
          error:
            result.error,
        },
        { status: 400 }
      );
    }

    const otpRecord =
      result.record;

    if (
      !otpRecord.username ||
      !otpRecord.passwordHash
    ) {
      return NextResponse.json(
        {
          error:
            "Registration verification data is incomplete.",
        },
        { status: 400 }
      );
    }

    const existingUser =
      await db.user.findFirst({
        where: {
          OR: [
            {
              email,
            },
            {
              username:
                otpRecord.username,
            },
          ],
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "This username or email is already registered.",
        },
        { status: 409 }
      );
    }

    const user =
      await db.user.create({
        data: {
          username:
            otpRecord.username,
          email,
          name:
            otpRecord.name,
          password:
            otpRecord.passwordHash,
          role:
            "USER",
          isActive: true,
        },
      });

    const token =
      await createSessionToken({
        userId:
          user.id,
        email:
          user.email,
        role:
          user.role,
      });

    const response =
      NextResponse.json({
        success: true,
        message:
          "Account created successfully.",
        user: {
          id:
            user.id,
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
      "OTP verification error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to verify OTP.",
      },
      { status: 500 }
    );
  }
}