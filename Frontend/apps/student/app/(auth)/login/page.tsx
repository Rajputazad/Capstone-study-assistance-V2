"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { forgotPassword, login } from "@/lib/api";
import { setAuthToken } from "@/lib/auth";

function Brand() {
  return (
    <div className="flex items-center justify-center gap-4">
      <div className="grid h-16 w-16 place-items-center rounded-[10px] bg-[#e72329] text-2xl font-extrabold text-white">
        CS
      </div>
      <div className="leading-none">
        <div className="text-[30px] font-extrabold tracking-normal text-slate-900">
          Capstone
        </div>
        <div className="mt-2 text-[15px] font-extrabold uppercase tracking-normal text-[#e72329]">
          Study Assistant
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const data = await login(email.trim(), password);
      setAuthToken(data.token);
      localStorage.setItem("capstone_auth_role", data.role);
      localStorage.setItem("capstone_auth_user", JSON.stringify(data.user));

      if (data.role === "Admin") {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get("redirect");
        const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001";
        const target = redirect || `${adminUrl}/login`;
        window.location.href = `${target}${target.includes("?") ? "&" : "?"}token=${encodeURIComponent(
          data.token,
        )}`;
        return;
      }

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setResetMessage("");

    try {
      const data = await forgotPassword(email.trim());
      sessionStorage.setItem("capstone_reset_email", email.trim());
      if (data.devOtp) {
        sessionStorage.setItem("capstone_reset_dev_otp", data.devOtp);
      } else {
        sessionStorage.removeItem("capstone_reset_dev_otp");
      }
      setResetMessage(data.message);
      router.push("/verify-otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] pt-1">
      <div className="fixed left-0 right-0 top-0 h-1 bg-[#e72329]" />
      <div className="mx-auto flex min-h-screen w-full max-w-[900px] flex-col items-center justify-center px-5 py-8">
        <div className="mb-8">
          <Brand />
        </div>

        <form
          className="w-full max-w-[640px] rounded-[20px] border border-slate-200 bg-white px-8 py-7 shadow-[0_18px_55px_rgba(15,23,42,0.08)] md:px-11"
          onSubmit={resetMode ? handleForgotPassword : handleSubmit}
        >
          <h1 className="text-[32px] font-extrabold leading-tight text-slate-900">
            {resetMode ? "Reset password" : "Sign in"}
          </h1>
          <p className="mt-1 text-[20px] text-slate-500">
            {resetMode
              ? "Enter your email and we will send a 6-digit reset code"
              : "Swinburne University of Technology"}
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="email" className="text-[18px] font-extrabold text-slate-700">
                Student / Staff Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@student.edu.au"
                className="mt-2 h-[60px] w-full rounded-[12px] border-2 border-slate-200 bg-white px-5 text-[20px] text-slate-800 transition focus:border-[#e72329] placeholder:text-slate-400"
              />
            </div>

            {!resetMode && (
              <div>
                <label htmlFor="password" className="text-[18px] font-extrabold text-slate-700">
                  Password
                </label>
                <div className="relative mt-2">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="h-[60px] w-full rounded-[12px] border-2 border-slate-200 bg-white px-5 pr-24 text-[20px] text-slate-800 transition focus:border-[#e72329] placeholder:text-slate-400"
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
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setResetMode((value) => !value);
              setError("");
              setResetMessage("");
            }}
            className="mt-5 text-[18px] font-semibold text-[#ef3a43]"
          >
            {resetMode ? "Back to sign in" : "Forgot password?"}
          </button>

          {error && <p className="mt-4 text-[16px] font-semibold text-[#e72329]">{error}</p>}
          {resetMessage && (
            <p className="mt-4 rounded-[10px] bg-emerald-50 px-4 py-3 text-[15px] font-semibold text-emerald-700">
              {resetMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-5 h-[60px] w-full rounded-[10px] bg-[#e72329] text-[21px] font-extrabold text-white transition hover:bg-[#cf102d] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy ? "Please wait..." : resetMode ? "Send Reset Code" : "Sign In"}
          </button>

          {resetMode && (
            <Link
              href="/verify-otp"
              className="mt-4 flex justify-center text-[16px] font-extrabold text-[#d8183a]"
            >
              I have a reset code
            </Link>
          )}

          <div className="my-4 h-px bg-slate-200" />

          <Link
            href="/register"
            className="flex h-[58px] w-full items-center justify-center rounded-[10px] border-2 border-[#e72329] text-[20px] font-extrabold text-[#d8183a] transition hover:bg-red-50"
          >
            Register New Account
          </Link>
        </form>
      </div>
    </main>
  );
}
