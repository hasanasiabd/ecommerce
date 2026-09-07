// FILE: src/app/api/admin/upload/route.ts

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

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            "Please provide an image file.",
        },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error:
            "Only image files are allowed.",
        },
        { status: 400 }
      );
    }

    const MAX_SIZE =
      10 * 1024 * 1024;

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          error:
            "Image must be smaller than 10MB.",
        },
        { status: 400 }
      );
    }

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    await cloudinary.api.ping();

    const result =
      await new Promise<{
        secure_url: string;
        public_id: string;
      }>(
        (resolve, reject) => {
          const uploadStream =
            cloudinary.uploader.upload_stream(
              {
                folder:
                  "myshop/products",
                resource_type:
                  "image",
              },
              (
                error,
                result
              ) => {
                if (error || !result) {
                  reject(
                    error ||
                      new Error(
                        "Cloudinary upload failed."
                      )
                  );
                  return;
                }

                resolve({
                  secure_url:
                    result.secure_url,
                  public_id:
                    result.public_id,
                });
              }
            );

          uploadStream.end(
            buffer
          );
        }
      );

    return NextResponse.json({
      success: true,
      image: {
        url: result.secure_url,
        publicId:
          result.public_id,
      },
    });
  } catch (error) {
    console.error(
      "Cloudinary upload error:",
      error
    );

    const cloudinaryError =
      error as {
        message?: string;
        http_code?: number;
        name?: string;
        error?: {
          message?: string;
        };
      };

    return NextResponse.json(
      {
        success: false,
        error:
          cloudinaryError.error?.message ||
          cloudinaryError.message ||
          "Unable to upload image.",

        details: {
          name:
            cloudinaryError.name ||
            null,

          httpCode:
            cloudinaryError.http_code ||
            null,
        },
      },
      {
        status:
          cloudinaryError.http_code === 403
            ? 403
            : 500,
      }
    );
  }
}