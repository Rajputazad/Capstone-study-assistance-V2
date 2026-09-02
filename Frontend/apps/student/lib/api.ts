"use client";

export type AuthRole = "Student" | "Admin";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role?: AuthRole;
  studentId?: string;
  approvedUnits?: string[];
  pendingUnits?: string[];
  status?: "Active" | "Inactive";
};

type AuthResponse = {
  token: string;
  role: AuthRole;
  user: AuthUser;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const raw = await response.text();
  const data = raw ? JSON.parse(raw) : null;

  if (!response.ok) {
    throw new ApiError(response.status, data?.message ?? response.statusText);
  }

  return data as T;
}

export function login(email: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function register(body: {
  name: string;
  email: string;
  password: string;
  studentId: string;
  primaryUnit: string;
}): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function forgotPassword(email: string): Promise<{ message: string; devOtp?: string }> {
  return request<{ message: string; devOtp?: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function verifyResetOtp(
  email: string,
  otp: string,
): Promise<{ token: string; message: string }> {
  return request<{ token: string; message: string }>("/auth/verify-reset-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export function resetPassword(
  token: string,
  password: string,
): Promise<{ message: string }> {
  return request<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}
