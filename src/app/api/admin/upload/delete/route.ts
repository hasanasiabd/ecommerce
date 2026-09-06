// FILE: src/app/api/admin/upload/delete/route.ts

import { NextResponse } from "next/server";

import cloudinary from "@/lib/cloudinary";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(
  request: Request
) {
  try {
    const session =
      await getSession();

    if (!session) {
      return NextResponse.json(
        {
          error:
            "Authentication required.",
        },
        { status: 401 }
      );
    }

    if (
      session.role !== "ADMIN" &&
      session.role !== "DEVELOPER"
    ) {
      return NextResponse.json(
        {
          error:
            "Administrator access required.",
        },
        { status: 403 }
      );
    }

    const body =
      await request.json();

    const publicId =
      typeof body.publicId ===
      "string"
        ? body.publicId.trim()
        : "";

    if (!publicId) {
      return NextResponse.json(
        {
          error:
            "Cloudinary public ID is required.",
        },
        { status: 400 }
      );
    }

    if (!publicId.startsWith("myshop/products/")) {
      return NextResponse.json(
        {
          error:
            "Invalid product image identifier.",
        },
        { status: 400 }
      );
    }

    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: "image",
      }
    );

    return NextResponse.json({
      success: true,
      message:
        "Image deleted from Cloudinary.",
    });
  } catch (error) {
    console.error(
      "Cloudinary delete error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to delete image.",
      },
      { status: 500 }
    );
  }
}