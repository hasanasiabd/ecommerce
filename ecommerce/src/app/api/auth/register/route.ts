// src/app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // ইউজার কি ইতিমধ্যে সম্পূর্ণ রেজিস্টার্ড?
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser && existingUser.password) {
      return NextResponse.json(
        { error: "Account already exists. Please login." },
        { status: 400 }
      );
    }

    // ৬ ডিজিটের OTP তৈরি ও মেয়ার নির্ধারণ (১০ মিনিট)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // পুরাতন OTP ডিলিট করে নতুনটা সেভ করা
    await db.otpVerification.deleteMany({ where: { email } });
    await db.otpVerification.create({
      data: { email, code: otpCode, expiresAt },
    });

    // TODO: ইমেইল পাঠানোর সার্ভিস (e.g. Resend/Nodemailer) দিয়ে otpCode পাঠাবেন
    console.log(`[AUTH OTP] Email: ${email} | Code: ${otpCode}`);

    return NextResponse.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}