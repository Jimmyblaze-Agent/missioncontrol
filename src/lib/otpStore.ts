// Shared in-memory OTP store
// Module-level singleton — same instance across route handlers in the same process
export const otpStore = new Map<string, { code: string; expiresAt: number }>();
