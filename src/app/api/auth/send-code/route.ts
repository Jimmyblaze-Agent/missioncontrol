import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";
import { otpStore } from "@/lib/otpStore";

const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL || "jkgbusiness@gmail.com";
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || email.toLowerCase().trim() !== ALLOWED_EMAIL.toLowerCase()) {
    return NextResponse.json(
      { success: false, error: "That email is not authorized." },
      { status: 403 }
    );
  }

  // Generate 6-digit OTP
  const code = String(crypto.randomInt(100000, 999999));
  const expiresAt = Date.now() + OTP_EXPIRY_MS;
  otpStore.set(ALLOWED_EMAIL.toLowerCase(), { code, expiresAt });

  // Send via AgentMail
  const agentMailKey = process.env.AGENTMAIL_API_KEY;
  if (!agentMailKey) {
    return NextResponse.json(
      { success: false, error: "AgentMail not configured." },
      { status: 500 }
    );
  }

  try {
    const res = await fetch("https://api.agentmail.to/v0/inboxes/jimmy@agentmail.to/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${agentMailKey}`,
      },
      body: JSON.stringify({
        to: ALLOWED_EMAIL,
        subject: "Mission Control login code",
        text: `Your Mission Control login code is: ${code}\n\nThis code expires in 10 minutes.`,
        html: `<p>Your Mission Control login code is:</p><h1 style="letter-spacing:4px">${code}</h1><p>This code expires in 10 minutes.</p>`,
      }),
    });

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

  return NextResponse.json({ success: true });
}
