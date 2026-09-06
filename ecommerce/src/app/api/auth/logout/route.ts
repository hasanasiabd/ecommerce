// src/app/api/auth/logout/route.ts

import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ 
      success: true, 
      message: "Logged out successfully" 
    });

    // সেশন কুকি ক্লিয়ার বা ডিলিট করা
    response.cookies.set({
      name: "myshop_session",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0, // মেয়াদ শূন্য করে কুকি মুছে ফেলা
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}