// FILE: src/app/api/developer/admins/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(
  request: Request
) {
  try {
    /*
     * ========================================================
     * VERIFY CURRENT SESSION
     * ========================================================
     */

    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    /*
     * ========================================================
     * ONLY DEVELOPER CAN CREATE ADMINS
     * ========================================================
     */

    if (session.role !== "DEVELOPER") {
      return NextResponse.json(
        {
          error:
            "Only a developer can create administrator accounts.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const username =
      typeof body.username === "string"
        ? body.username.trim().toLowerCase()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    /*
     * ========================================================
     * VALIDATION
     * ========================================================
     */

    if (!username || !email || !password) {
      return NextResponse.json(
        {
          error:
            "Username, email and password are required.",
        },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
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

    /*
     * ========================================================
     * CHECK DUPLICATE USERNAME / EMAIL
     * ========================================================
     */

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
      if (existingUser.username === username) {
        return NextResponse.json(
          {
            error:
              "This username is already in use.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          error:
            "This email is already in use.",
        },
        { status: 409 }
      );
    }

    /*
     * ========================================================
     * HASH PASSWORD
     * ========================================================
     */

    const passwordHash =
      await bcrypt.hash(password, 12);

    /*
     * ========================================================
     * CREATE ADMIN
     * ========================================================
     */

    const admin =
      await db.user.create({
        data: {
          username,
          email,
          name:
            name || username,
          password: passwordHash,
          role: "ADMIN",
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Administrator account created successfully.",
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          createdAt: admin.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create admin error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to create administrator account.",
      },
      { status: 500 }
    );
  }
}