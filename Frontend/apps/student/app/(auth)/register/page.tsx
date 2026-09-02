"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { register } from "@/lib/api";
import { setAuthToken } from "@/lib/auth";
import { unitCatalog } from "@/lib/user-data";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [primaryUnit, setPrimaryUnit] = useState("COS40005");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the terms to continue");
      return;
    }

    setBusy(true);

    try {
      const data = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        studentId: studentId.trim(),
        primaryUnit,
      });
      setAuthToken(data.token);
      localStorage.setItem("capstone_auth_role", data.role);
      localStorage.setItem("capstone_auth_user", JSON.stringify(data.user));

      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] pt-1">
      <div className="fixed left-0 right-0 top-0 h-1 bg-[#e72329]" />
      <div className="mx-auto flex min-h-screen w-full max-w-[980px] items-center justify-center px-5 py-8">
        <form
          className="w-full max-w-[860px] rounded-[18px] border border-slate-200 bg-white px-7 py-8 shadow-[0_18px_55px_rgba(15,23,42,0.08)] md:px-14"
          onSubmit={handleSubmit}
        >
          <h1 className="text-[34px] font-extrabold leading-tight text-slate-900">
            Create an account
          </h1>
          <p className="mt-1 text-[20px] text-slate-500">
            Enter your student details to register for Capstone Assistant
          </p>

          <div className="mt-5">
            <label htmlFor="name" className="text-[18px] font-extrabold text-slate-700">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Jordan Tan"
              className="mt-2 h-[58px] w-full rounded-[10px] border-2 border-slate-200 bg-slate-50 px-5 text-[20px] text-slate-800 transition focus:border-[#e72329] placeholder:text-slate-400"
            />
          </div>

          <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="studentId" className="text-[18px] font-extrabold text-slate-700">
                  Student ID
                </label>
                <input
                  id="studentId"
                  type="text"
                  required
                  value={studentId}
                  onChange={(event) => setStudentId(event.target.value)}
                  placeholder="e.g. 104123456"
                  className="mt-2 h-[58px] w-full rounded-[10px] border-2 border-slate-200 bg-slate-50 px-5 text-[20px] text-slate-800 transition focus:border-[#e72329] placeholder:text-slate-400"
                />
              </div>

              <div>
                <label htmlFor="primaryUnit" className="text-[18px] font-extrabold text-slate-700">
                  Primary Enrolled Unit
                </label>
                <select
                  id="primaryUnit"
                  value={primaryUnit}
                  onChange={(event) => setPrimaryUnit(event.target.value)}
                  className="mt-2 h-[58px] w-full rounded-[10px] border-2 border-slate-200 bg-slate-50 px-5 text-[18px] text-slate-700 transition focus:border-[#e72329]"
                >
                  {unitCatalog.map((unit) => (
                    <option key={unit.code} value={unit.code}>
                      {unit.code}
                    </option>
                  ))}
                </select>
              </div>
          </div>

          <div className="mt-3">
            <label htmlFor="email" className="text-[18px] font-extrabold text-slate-700">
              Student Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="student@student.swin.edu.au"
              className="mt-2 h-[58px] w-full rounded-[10px] border-2 border-slate-200 bg-slate-50 px-5 text-[20px] text-slate-800 transition focus:border-[#e72329] placeholder:text-slate-400"
            />
          </div>

          <div className="mt-3">
            <label htmlFor="password" className="text-[18px] font-extrabold text-slate-700">
              Password
            </label>
            <div className="relative mt-2">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-[58px] w-full rounded-[10px] border-2 border-slate-200 bg-slate-50 px-5 pr-24 text-[20px] text-slate-800 transition focus:border-[#e72329]"
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

          <div className="mt-3">
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
                className="h-[58px] w-full rounded-[10px] border-2 border-slate-200 bg-slate-50 px-5 pr-24 text-[20px] text-slate-800 transition focus:border-[#e72329]"
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

          <label className="mt-6 flex items-start gap-4 text-[17px] text-slate-500">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              className="mt-0.5 h-6 w-6 shrink-0 rounded border-2 border-slate-300"
            />
            <span>
              I agree to the{" "}
              <span className="font-medium text-[#e72329]">Terms of Service</span>{" "}
              and{" "}
              <span className="font-medium text-[#e72329]">
                Academic Integrity Guidelines
              </span>
            </span>
          </label>

          {error && <p className="mt-4 text-[16px] font-semibold text-[#e72329]">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 h-[60px] w-full rounded-[10px] bg-[#e4002b] text-[21px] font-extrabold text-white transition hover:bg-[#cf102d] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy ? "Creating account..." : "Create Account"}
          </button>

          <p className="mt-5 text-center text-[19px] text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-extrabold text-[#d8183a]">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}
