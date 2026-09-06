// src/app/api/auth/verify-otp/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, code, name, password } = await req.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and OTP code are required" },
        { status: 400 }
      );
    }

    // ১. OTP চেক করা
    const validOtp = await db.otpVerification.findFirst({
      where: { email, code },
    });

    if (!validOtp || validOtp.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // ২. ওটিপি ভেরিফাই হওয়ার সাথে সাথেই সবার আগে ডাটাবেজ থেকে রিমুভ করা যাতে ডাবল রিকোয়েস্ট ব্লক হয়
    await db.otpVerification.deleteMany({ where: { email } });

    // ৩. `.env` থেকে মাস্টার ডেভ ইমেইল রিড করা
    const masterDevEmail = process.env.MASTER_DEV_EMAIL;
    const isMasterDev =
      masterDevEmail && email.toLowerCase() === masterDevEmail.toLowerCase();

    const assignedRole = isMasterDev ? "DEVELOPER" : "USER";

    // ৪. পাসওয়ার্ড দেওয়া থাকলে হ্যাশ করা
    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    // ৫. ডাটাবেজে ইউজার ম্যানেজমেন্ট
    let user = await db.user.findUnique({ where: { email } });

    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name: name || null,
          password: hashedPassword || null,
          role: assignedRole,
        },
      });
    } else {
      user = await db.user.update({
        where: { email },
        data: {
          ...(name && { name }),
          ...(hashedPassword && { password: hashedPassword }),
          ...(isMasterDev && { role: "DEVELOPER" }),
        },
      });
    }

    // ৬. JWT Token তৈরি করা
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    // ৭. কুকি সেট করা
    const response = NextResponse.json({ success: true, user });
    response.cookies.set("myshop_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}