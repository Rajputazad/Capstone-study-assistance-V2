"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { resetPassword } from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("capstone_reset_token") ?? "";
    setToken(storedToken);
    if (!storedToken) {
      router.replace("/login");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Your reset session has expired. Send a new code.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setBusy(true);

    try {
      const data = await resetPassword(token, password);
      sessionStorage.removeItem("capstone_reset_email");
      sessionStorage.removeItem("capstone_reset_token");
      setMessage(data.message);
      setTimeout(() => router.push("/login"), 1400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] pt-1">
      <div className="fixed left-0 right-0 top-0 h-1 bg-[#e72329]" />
      <div className="mx-auto flex min-h-screen w-full max-w-[760px] items-center justify-center px-5 py-8">
        <form
          className="w-full rounded-[20px] border border-slate-200 bg-white px-8 py-8 shadow-[0_18px_55px_rgba(15,23,42,0.08)] md:px-11"
          onSubmit={handleSubmit}
        >
          <h1 className="text-[32px] font-extrabold leading-tight text-slate-900">
            Create new password
          </h1>
          <p className="mt-1 text-[20px] text-slate-500">
            Your code is verified. Choose a new password.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="password" className="text-[18px] font-extrabold text-slate-700">
                New Password
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-[60px] w-full rounded-[12px] border-2 border-slate-200 bg-white px-5 pr-24 text-[20px] text-slate-800 transition focus:border-[#e72329]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-extrabold text-[#e72329]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="text-[18px] font-extrabold text-slate-700"
              >
                Confirm Password
              </label>
              <div className="relative mt-2">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="h-[60px] w-full rounded-[12px] border-2 border-slate-200 bg-white px-5 pr-24 text-[20px] text-slate-800 transition focus:border-[#e72329]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[14px] font-extrabold text-[#e72329]"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
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
            {busy ? "Updating..." : "Reset Password"}
          </button>

          <Link
            href="/login"
            className="mt-5 flex justify-center text-[17px] font-extrabold text-[#d8183a]"
          >
            Back to Sign In
          </Link>
        </form>
      </div>
    </main>
  );
}
