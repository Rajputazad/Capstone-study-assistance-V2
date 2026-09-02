"use client";

import {
  useEffect,
} from "react";

import {
  useRouter,
} from "next/navigation";
import { setToken } from "@/lib/api";

export default function Login() {
  const router =
    useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      setToken(token);
      localStorage.setItem("capstone_auth_role", "Admin");
      router.replace("/");
      return;
    }

    const sharedLoginUrl =
      process.env.NEXT_PUBLIC_SHARED_LOGIN_URL ?? "http://localhost:3000/login";
    const adminUrl =
      process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001";

    window.location.replace(
      `${sharedLoginUrl}?redirect=${encodeURIComponent(`${adminUrl}/login`)}`,
    );
  }, [router]);

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

        <div
          className="loginCard"
        >
          <h1>
            Redirecting
          </h1>

          <p className="loginUniversity">
            Opening the shared Capstone sign in page...
          </p>
        </div>
      </div>
    </div>
  );
}
