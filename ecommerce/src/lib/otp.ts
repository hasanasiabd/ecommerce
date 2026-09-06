// FILE: src/lib/otp.ts

import crypto from "crypto";
import { db } from "@/lib/db";

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 5;

function hashOtp(
  code: string
) {
  return crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");
}

function generateOtp() {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
}

export async function createOtp(
  data: {
    email: string;
    username?: string;
    name?: string;
    passwordHash?: string;
    purpose:
      | "REGISTRATION"
      | "DEVELOPER_LOGIN";
  }
) {
  const code =
    generateOtp();

  const expiresAt =
    new Date(
      Date.now() +
        OTP_EXPIRY_MINUTES *
          60 *
          1000
    );

  await db.otpVerification.deleteMany(
    {
      where: {
        email: data.email,
        purpose:
          data.purpose,
      },
    }
  );

  await db.otpVerification.create(
    {
      data: {
        email: data.email,
        username:
          data.username ??
          null,
        name:
          data.name ??
          null,
        passwordHash:
          data.passwordHash ??
          null,
        codeHash:
          hashOtp(code),
        purpose:
          data.purpose,
        expiresAt,
      },
    }
  );

  return {
    code,
    expiresAt,
  };
}

export async function verifyOtp(
  data: {
    email: string;
    code: string;
    purpose:
      | "REGISTRATION"
      | "DEVELOPER_LOGIN";
  }
) {
  const record =
    await db.otpVerification.findFirst(
      {
        where: {
          email: data.email,
          purpose:
            data.purpose,
        },
        orderBy: {
          createdAt:
            "desc",
        },
      }
    );

  if (!record) {
    return {
      success: false as const,
      error:
        "Invalid or expired OTP.",
    };
  }

  if (
    record.expiresAt <
    new Date()
  ) {
    await db.otpVerification.delete(
      {
        where: {
          id: record.id,
        },
      }
    );

    return {
      success: false as const,
      error:
        "OTP has expired.",
    };
  }

  if (
    record.attempts >=
    MAX_OTP_ATTEMPTS
  ) {
    await db.otpVerification.delete(
      {
        where: {
          id: record.id,
        },
      }
    );

    return {
      success: false as const,
      error:
        "Too many incorrect OTP attempts.",
    };
  }

  if (
    hashOtp(data.code) !==
    record.codeHash
  ) {
    await db.otpVerification.update(
      {
        where: {
          id: record.id,
        },
        data: {
          attempts: {
            increment: 1,
          },
        },
      }
    );

    return {
      success: false as const,
      error:
        "Invalid OTP.",
    };
  }

  await db.otpVerification.delete(
    {
      where: {
        id: record.id,
      },
    }
  );

  return {
    success: true as const,
    record,
  };
}