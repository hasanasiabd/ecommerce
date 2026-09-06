import { Resend } from 'resend';
import { db } from './db';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(email: string) {
  // ৬ ডিজিটের র্যান্ডম ওটিপি জেনারেট
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // ওটিপির মেয়াদের জন্য ৫ মিনিট সময় নির্ধারণ
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // পুরনো ওটিপি থাকলে মুছে নতুনটি ডাটাবেজে সেভ করা
  await db.otpVerification.deleteMany({ where: { email } });
  await db.otpVerification.create({
    data: {
      email,
      code: otpCode,
      expiresAt,
    },
  });

  // Resend দিয়ে ইমেইল পাঠানো
  const { data, error } = await resend.emails.send({
    from: 'My Shop Auth <onboarding@resend.dev>',
    to: email,
    subject: 'Your Verification Code - My Shop',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #4F46E5;">My Shop Verification Code</h2>
        <p>Use the code below to verify your login attempt:</p>
        <div style="background-color: #f3f4f6; padding: 12px 24px; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #1f2937; width: fit-content; border-radius: 6px;">
          ${otpCode}
        </div>
        <p style="color: #6b7280; font-size: 14px; margin-top: 16px;">This code will expire in 5 minutes.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return data;
}