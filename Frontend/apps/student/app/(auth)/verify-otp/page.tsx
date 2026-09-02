"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { forgotPassword, verifyResetOtp } from "@/lib/api";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("capstone_reset_email") ?? "";
    const devOtp = sessionStorage.getItem("capstone_reset_dev_otp") ?? "";
    setEmail(storedEmail);
    setOtp(devOtp);
    if (!storedEmail) {
      router.replace("/login");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (otp.length !== 6) {
      setError("Enter the 6-digit reset code");
      return;
    }

    setBusy(true);

    try {
      const data = await verifyResetOtp(email, otp);
      sessionStorage.setItem("capstone_reset_token", data.token);
      setMessage(data.message);
      router.push("/reset-password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify code");
    } finally {
      setBusy(false);
    }
  }

  async function resendCode() {
    setError("");
    setMessage("");
    setResending(true);

    try {
      const data = await forgotPassword(email);
      if (data.devOtp) {
        sessionStorage.setItem("capstone_reset_dev_otp", data.devOtp);
        setOtp(data.devOtp);
      }
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend code");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] pt-1">
      <div className="fixed left-0 right-0 top-0 h-1 bg-[#e72329]" />
      <div className="mx-auto flex min-h-screen w-full max-w-[720px] items-center justify-center px-5 py-8">
        <form
          className="w-full rounded-[20px] border border-slate-200 bg-white px-8 py-8 shadow-[0_18px_55px_rgba(15,23,42,0.08)] md:px-11"
          onSubmit={handleSubmit}
        >
          <h1 className="text-[32px] font-extrabold leading-tight text-slate-900">
            Verify reset code
          </h1>
          <p className="mt-1 text-[20px] text-slate-500">
            Enter the 6-digit code sent to {email}
          </p>

          <div className="mt-6">
            <label htmlFor="otp" className="text-[18px] font-extrabold text-slate-700">
              6-Digit Code
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              required
              maxLength={6}
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              className="mt-2 h-[64px] w-full rounded-[12px] border-2 border-slate-200 bg-white px-5 text-center text-[26px] font-extrabold tracking-[0.35em] text-slate-800 transition focus:border-[#e72329] placeholder:tracking-normal placeholder:text-slate-400"
            />
          </div>

          {error && <p className="mt-4 text-[16px] font-semibold text-[#e72329]">{error}</p>}
          {message && (
            <p className="mt-4 rounded-[10px] bg-emerald-50 px-4 py-3 text-[15px] font-semibold text-emerald-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 h-[60px] w-full rounded-[10px] bg-[#e72329] text-[21px] font-extrabold text-white transition hover:bg-[#cf102d] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy ? "Verifying..." : "Verify Code"}
          </button>

          <div className="mt-5 flex items-center justify-between gap-4 text-[16px] font-extrabold">
            <button
              type="button"
              disabled={resending || !email}
              onClick={resendCode}
              className="text-[#d8183a] disabled:opacity-60"
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
            <Link href="/login" className="text-slate-500">
              Back to Sign In
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
