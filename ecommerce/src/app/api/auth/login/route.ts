// src/app/api/auth/login/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET || "fallback_secret_key_12345";

    // ১. মাস্টার ডেভেলপার চেক
    const isMasterDev = 
      (email === process.env.MASTER_DEV_EMAIL || email === usernameMatch(email)) && 
      password === process.env.MASTER_DEV_PASSWORD;

    const targetEmail = process.env.MASTER_DEV_EMAIL!;

    if (isMasterDev) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      await db.otpVerification.deleteMany({ where: { email: targetEmail } });
      await db.otpVerification.create({
        data: { email: targetEmail, code, expiresAt },
      });

      await resend.emails.send({
        from: "My Shop <onboarding@resend.dev>",
        to: targetEmail,
        subject: "Developer Console Login OTP",
        html: `<p>Your secure login OTP code is: <strong>${code}</strong>. It expires in 5 minutes.</p>`,
      });

      return NextResponse.json({ 
        success: true, 
        requireOtp: true,
        email: targetEmail 
      });
    }

    // ২. সাধারণ ইউজারের জন্য ডাটাবেজ চেক
    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
    }

    // JWT টোকেন জেনারেট করা
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role || "CUSTOMER" },
      jwtSecret,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({ 
      success: true, 
      message: "Logged in successfully",
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    });

    response.cookies.set({
      name: "myshop_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function usernameMatch(input: string) {
  return input === process.env.DEV_USERNAME ? process.env.MASTER_DEV_EMAIL : null;
}