import { NextResponse } from 'next/server';
import { sendOtpEmail } from '@/lib/resend';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await sendOtpEmail(email);

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}