// FILE: src/app/api/developer/admins/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

/**
 * GET
 * Developer only.
 * Returns all admin accounts.
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    if (session.role !== "DEVELOPER") {
      return NextResponse.json(
        {
          error:
            "Only developers can access administrator management.",
        },
        { status: 403 }
      );
    }

    const admins = await db.user.findMany({
      where: {
        role: "ADMIN",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      admins,
    });
  } catch (error) {
    console.error(
      "Get admins error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load administrator accounts.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST
 * Developer only.
 * Creates a new ADMIN.
 */
export async function POST(
  request: Request
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    if (session.role !== "DEVELOPER") {
      return NextResponse.json(
        {
          error:
            "Only developers can create administrators.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const username =
      typeof body.username === "string"
        ? body.username
            .trim()
            .toLowerCase()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email
            .trim()
            .toLowerCase()
        : "";

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    if (
      !username ||
      !email ||
      !password
    ) {
      return NextResponse.json(
        {
          error:
            "Username, email and password are required.",
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
            "Username must contain 3-30 lowercase letters, numbers or underscores.",
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
            "Please enter a valid email address.",
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

    const duplicate =
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
        select: {
          username: true,
          email: true,
        },
      });

    if (duplicate) {
      return NextResponse.json(
        {
          error:
            duplicate.username === username
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

    const admin =
      await db.user.create({
        data: {
          username,
          email,
          name:
            name || username,
          password:
            passwordHash,
          role: "ADMIN",
          isActive: true,
        },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Administrator created successfully.",
        admin,
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
          "Unable to create administrator.",
      },
      { status: 500 }
    );
  }
}