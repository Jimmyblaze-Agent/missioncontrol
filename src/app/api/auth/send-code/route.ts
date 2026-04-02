import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";
import { SignJWT } from "jose";

const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL || "jkgbusiness@gmail.com";
const OTP_EXPIRY_SECONDS = 10 * 60; // 10 minutes

function getOtpSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET || "fallback-otp-secret-change-me";
  return new TextEncoder().encode(secret);
}

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || email.toLowerCase().trim() !== ALLOWED_EMAIL.toLowerCase().trim()) {
    return NextResponse.json(
      { success: false, error: "That email is not authorized." },
      { status: 403 }
    );
  }

  // Generate 6-digit OTP
  const code = String(crypto.randomInt(100000, 999999));

  // Sign OTP into a short-lived JWT stored in a cookie
  const token = await new SignJWT({ code, email: ALLOWED_EMAIL.toLowerCase() })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${OTP_EXPIRY_SECONDS}s`)
    .sign(getOtpSecret());

  // Send via AgentMail
  const agentMailKey = process.env.AGENTMAIL_API_KEY;
  if (!agentMailKey) {
    return NextResponse.json(
      { success: false, error: "AgentMail not configured." },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      "https://api.agentmail.to/v0/inboxes/jimmyblaze@agentmail.to/messages/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${agentMailKey}`,
        },
        body: JSON.stringify({
          to: ALLOWED_EMAIL,
          subject: "Mission Control login code",
          text: `Your Mission Control login code is: ${code}\n\nThis code expires in 10 minutes.`,
          html: `<p style="font-family:sans-serif">Your Mission Control login code is:</p><h1 style="letter-spacing:6px;font-family:monospace">${code}</h1><p style="font-family:sans-serif;color:#888">Expires in 10 minutes.</p>`,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("AgentMail error:", err);
      return NextResponse.json(
        { success: false, error: "Failed to send code. Please try again." },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("AgentMail fetch error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to send code. Please try again." },
      { status: 500 }
    );
  }

  // Store OTP token in a cookie so login route can verify it (stateless)
  const response = NextResponse.json({ success: true });
  response.cookies.set("mc_otp", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: OTP_EXPIRY_SECONDS,
    path: "/",
  });

  return response;
}
