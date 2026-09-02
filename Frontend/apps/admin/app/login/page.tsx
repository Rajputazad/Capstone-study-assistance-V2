"use client";

import {
  FormEvent,
  useState,
} from "react";

import { login } from "@/lib/api";

import {
  useRouter,
} from "next/navigation";

export default function Login() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [busy, setBusy] =
    useState(false);

  const router =
    useRouter();

  async function submit(
    event: FormEvent
  ) {
    event.preventDefault();

    if (
      !email.trim() ||
      !password.trim()
    ) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      await login(
        email.trim(),
        password
      );

      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Sign in failed"
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="loginPage">
      <div className="loginWrap">
        <div className="loginBrand">
          <div className="logoBox">
            CS
          </div>

          <div>
            <div className="brandName">
              Capstone
            </div>

            <div className="brandTag">
              STUDY ASSISTANT
            </div>
          </div>
        </div>

        <form
          className="loginCard"
          onSubmit={submit}
        >
          <h1>
            Sign in
          </h1>

          <p className="loginUniversity">
            Swinburne University of Technology
          </p>

          <div className="field">
            <label>
              Student / Staff Email
            </label>

            <input
              type="email"
              placeholder="you@student.edu.au"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
            />
          </div>

          <div className="field">
            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={
                password
              }
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
            />
          </div>

          <button
            type="button"
            className="forgot"
          >
            Forgot password?
          </button>

          {error && (
            <p className="loginError">
              {error}
            </p>
          )}

          <button
            className="signBtn"
            type="submit"
            disabled={busy}
          >
            {busy
              ? "Signing in..."
              : "Sign In"}
          </button>
        </form>

        <div className="demoBox">
          <strong>
            Demo credentials
          </strong>

          <span>
            Admin: admin@capstone.edu.au / Admin@123
          </span>
        </div>
      </div>
    </div>
  );
}