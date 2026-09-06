// FILE: src/app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { createOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/resend";

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const username =
      typeof body.username === "string"
        ? body.username
            .trim()
            .toLowerCase()
        : "";

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email
            .trim()
            .toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (
      !username ||
      !name ||
      !email ||
      !password
    ) {
      return NextResponse.json(
        {
          error:
            "Username, name, email and password are required.",
        },
        { status: 400 }
      );
    }

    if (
      !/^[a-z0-9_]{3,30}$/.test(
        username
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Username must be 3-30 characters and may contain only lowercase letters, numbers and underscores.",
        },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters long.",
        },
        { status: 400 }
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide a valid email address.",
        },
        { status: 400 }
      );
    }

    const existingUser =
      await db.user.findFirst({
        where: {
          OR: [
            {
              username,
            },
            {
              email,
            },
          ],
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            existingUser.username ===
            username
              ? "Username already exists."
              : "Email already exists.",
        },
        { status: 409 }
      );
    }

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    const { code } =
      await createOtp({
        email,
        username,
        name,
        passwordHash,
        purpose:
          "REGISTRATION",
      });

    /*
     * Username is not stored in the
     * current OTP model yet.
     *
     * We will add it in the next
     * database refinement.
     */

    await sendOtpEmail(
      email,
      code,
      "REGISTRATION"
    );

    return NextResponse.json({
      success: true,
      message:
        "Verification code sent to your email.",
      email,
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to start registration.",
      },
      { status: 500 }
    );
  }
}