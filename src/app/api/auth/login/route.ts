import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL || "jkgbusiness@gmail.com";

// Rate limiting (per-IP)
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;
interface AttemptRecord { count: number; windowStart: number; lockedUntil?: number; }
const attempts = new Map<string, AttemptRecord>();

function getOtpSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET || "fallback-otp-secret-change-me";
  return new TextEncoder().encode(secret);
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record) return { allowed: true };
  if (record.lockedUntil && now < record.lockedUntil)
    return { allowed: false, retryAfterMs: record.lockedUntil - now };
  if (now - record.windowStart > WINDOW_MS) { attempts.delete(ip); return { allowed: true }; }
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_MS;
    attempts.set(ip, record);
    return { allowed: false, retryAfterMs: LOCKOUT_MS };
  }
  return { allowed: true };
}

function recordFailure(ip: string): void {
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record || now - record.windowStart > WINDOW_MS) {
    attempts.set(ip, { count: 1, windowStart: now });
  } else {
    record.count += 1;
    attempts.set(ip, record);
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, retryAfterMs } = checkRateLimit(ip);
  if (!allowed) {
    const retryAfterSec = Math.ceil((retryAfterMs ?? LOCKOUT_MS) / 1000);
    return NextResponse.json(
      { success: false, error: "Too many attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
    );
  }

  const { email, code } = await request.json();

  if (!email || email.toLowerCase().trim() !== ALLOWED_EMAIL.toLowerCase().trim()) {
    recordFailure(ip);
    return NextResponse.json({ success: false, error: "Not authorized." }, { status: 403 });
  }

  // Read OTP token from cookie
  const otpToken = request.cookies.get("mc_otp")?.value;
  if (!otpToken) {
    recordFailure(ip);
    return NextResponse.json(
      { success: false, error: "No active code. Please request a new one." },
      { status: 401 }
    );
  }

  // Verify JWT and extract stored code
  let payload: { code: string; email: string };
  try {
    const { payload: p } = await jwtVerify(otpToken, getOtpSecret());
    payload = p as { code: string; email: string };
  } catch {
    recordFailure(ip);
    return NextResponse.json(
      { success: false, error: "Code expired. Please request a new one." },
      { status: 401 }
    );
  }

  if (code !== payload.code) {
    recordFailure(ip);
    return NextResponse.json({ success: false, error: "Incorrect code." }, { status: 401 });
  }

  // Success — clear OTP cookie, set session cookie
  attempts.delete(ip);
  const sessionSecret = process.env.SESSION_SECRET || "fallback-secret";
  const response = NextResponse.json({ success: true });

  response.cookies.set("mc_otp", "", { maxAge: 0, path: "/" });
  response.cookies.set("mc_auth", sessionSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return response;
}
