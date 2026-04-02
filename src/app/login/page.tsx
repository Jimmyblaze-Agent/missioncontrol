"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Terminal, Mail, KeyRound, AlertCircle } from "lucide-react";

function LoginForm() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setStep("code");
      } else {
        setError(data.error || "Failed to send code. Check the email address.");
      }
    } catch {
      setError("Connection error. Please try again.");
    }

    setLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (data.success) {
        const from = searchParams.get("from") || "/";
        router.push(from);
        router.refresh();
      } else {
        setError(data.error || "Invalid or expired code.");
      }
    } catch {
      setError("Connection error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div
      className="rounded-xl p-10"
      style={{
        backgroundColor: "var(--card)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <div className="text-center mb-8 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-7 h-7" style={{ color: "var(--accent)" }} />
          <h1
            className="text-xl font-bold"
            style={{
              fontFamily: "var(--font-heading)",
              color: "var(--text-primary)",
              letterSpacing: "-0.5px",
            }}
          >
            Mission Control
          </h1>
        </div>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {step === "email"
            ? "Enter your email to receive a login code"
            : `Code sent to ${email}`}
        </p>
      </div>

      {/* Step 1 — Email */}
      {step === "email" && (
        <form onSubmit={handleSendCode} className="space-y-6">
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px]"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-lg text-sm"
              style={{
                backgroundColor: "var(--card-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              placeholder="your@email.com"
              required
              autoFocus
            />
          </div>

          {error && (
            <div
              className="flex items-center gap-2 text-sm px-4 py-3 rounded-lg"
              style={{
                backgroundColor: "var(--error-bg)",
                color: "var(--error)",
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)", color: "white" }}
          >
            {loading ? "Sending..." : "Send login code"}
          </button>
        </form>
      )}

      {/* Step 2 — Code */}
      {step === "code" && (
        <form onSubmit={handleVerifyCode} className="space-y-6">
          <div className="relative">
            <KeyRound
              className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px]"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full pl-11 pr-4 py-3 rounded-lg text-sm tracking-widest"
              style={{
                backgroundColor: "var(--card-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              placeholder="6-digit code"
              inputMode="numeric"
              maxLength={6}
              required
              autoFocus
            />
          </div>

          {error && (
            <div
              className="flex items-center gap-2 text-sm px-4 py-3 rounded-lg"
              style={{
                backgroundColor: "var(--error-bg)",
                color: "var(--error)",
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
            style={{ backgroundColor: "var(--accent)", color: "white" }}
          >
            {loading ? "Verifying..." : "Sign in"}
          </button>

          <button
            type="button"
            onClick={() => { setStep("email"); setError(""); setCode(""); }}
            className="w-full text-sm py-2"
            style={{ color: "var(--text-muted)" }}
          >
            ← Use a different email
          </button>
        </form>
      )}

      <p
        className="text-center text-xs mt-6"
        style={{ color: "var(--text-muted)" }}
      >
        GreenOx Digital — Mission Control
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 -ml-64"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="w-full max-w-md">
        <Suspense
          fallback={
            <div
              className="rounded-xl p-10 animate-pulse"
              style={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="h-8 bg-gray-700 rounded mb-4" />
              <div className="h-12 bg-gray-700 rounded mb-4" />
              <div className="h-10 bg-gray-700 rounded" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
