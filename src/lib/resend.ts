// FILE: src/lib/resend.ts

import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  throw new Error("RESEND_API_KEY is not configured.");
}

const resend = new Resend(apiKey);

export async function sendOtpEmail(
  email: string,
  otp: string,
  purpose:
    | "REGISTRATION"
    | "DEVELOPER_LOGIN"
) {
  const isDeveloper =
    purpose === "DEVELOPER_LOGIN";

  const subject = isDeveloper
    ? "Developer Console OTP - MyShop"
    : "Verify Your MyShop Account";

  const title = isDeveloper
    ? "Developer Console Verification"
    : "MyShop Email Verification";

  const from =
    process.env.RESEND_FROM_EMAIL ||
    "MyShop <onboarding@resend.dev>";

  const { data, error } =
    await resend.emails.send({
      from,
      to: email,
      subject,
      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 520px;
          margin: 40px auto;
          padding: 32px;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          background: #ffffff;
        ">
          <h2>${title}</h2>

          <p>
            Your verification code is:
          </p>

          <div style="
            margin: 20px 0;
            padding: 18px;
            text-align: center;
            border-radius: 12px;
            background: #f3f4f6;
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 8px;
          ">
            ${otp}
          </div>

          <p>
            This code will expire in 5 minutes.
          </p>

          <p style="
            margin-top: 24px;
            color: #6b7280;
            font-size: 13px;
          ">
            If you did not request this code,
            you can safely ignore this email.
          </p>
        </div>
      `,
    });

  if (error) {
    throw new Error(
      `Unable to send OTP email: ${error.message}`
    );
  }

  return data;
}