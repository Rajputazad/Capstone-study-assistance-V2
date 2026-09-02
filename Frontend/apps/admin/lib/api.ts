/**
 * Client for the admin backend (../../backend).
 * Keeps the JWT in localStorage and attaches it to every request.
 */
import type {
  AdminUser,
  OverviewData,
  RequestStatus,
  Resource,
  Student,
  UnitAccessRequest,
} from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "capstone_auth_token";

export const getToken = () =>
  typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

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
  const token = getToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const raw = await response.text();
  const data = raw ? JSON.parse(raw) : null;

  if (!response.ok) {
    throw new ApiError(response.status, data?.message ?? response.statusText);
  }

  return data as T;
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) });
const patch = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) });
const del = (path: string) => request<void>(path, { method: "DELETE" });

/** "2026-08-15 10:30" — matches the format the tables already render. */
function formatDate(value: string | null | undefined): string {
  if (!value) return "Never";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

type RawRequest = Omit<UnitAccessRequest, "requestedAt"> & { requestedAt: string };
type RawAdmin = Omit<AdminUser, "lastLogin"> & { lastLogin: string | null };
type AuthLoginResponse = {
  token: string;
  role: "Admin" | "Student";
  user: RawAdmin;
  admin?: RawAdmin;
};

const normaliseRequest = (r: RawRequest): UnitAccessRequest => ({
  ...r,
  requestedAt: formatDate(r.requestedAt),
});

const normaliseAdmin = (a: RawAdmin): AdminUser => ({
  ...a,
  lastLogin: formatDate(a.lastLogin),
});

/* ---------------- Auth ---------------- */

export async function login(email: string, password: string): Promise<AdminUser> {
  const data = await post<AuthLoginResponse>("/auth/login", {
    email,
    password,
  });

  if (data.role !== "Admin") {
    throw new ApiError(403, "Please sign in with an admin account");
  }

  setToken(data.token);
  return normaliseAdmin(data.admin ?? data.user);
}

export function logout() {
  clearToken();
}

/* ---------------- Overview ---------------- */

export async function fetchOverview(): Promise<OverviewData> {
  const data = await get<Omit<OverviewData, "recentRequests"> & {
    recentRequests: RawRequest[];
  }>("/overview");

  return { ...data, recentRequests: data.recentRequests.map(normaliseRequest) };
}

/* ---------------- Students ---------------- */

export const fetchStudents = (search = "") =>
  get<Student[]>(`/students${search ? `?search=${encodeURIComponent(search)}` : ""}`);

export const grantUnit = (id: string, unitCode: string) =>
  patch<Student>(`/students/${id}/units`, { unitCode, action: "grant" });

export const revokeUnit = (id: string, unitCode: string) =>
  patch<Student>(`/students/${id}/units`, { unitCode, action: "revoke" });

export const deleteStudent = (id: string) => del(`/students/${id}`);

/* ---------------- Unit access requests ---------------- */

export async function fetchRequests(): Promise<UnitAccessRequest[]> {
  const data = await get<RawRequest[]>("/unit-requests");
  return data.map(normaliseRequest);
}

export async function decideRequest(
  id: string,
  status: Exclude<RequestStatus, "Pending">,
): Promise<UnitAccessRequest> {
  return normaliseRequest(await patch<RawRequest>(`/unit-requests/${id}`, { status }));
}

/* ---------------- Resources ---------------- */

export const fetchResources = () => get<Resource[]>("/resources");

export const createResource = (body: {
  title: string;
  filename: string;
  category: string;
  type: string;
  units: string[];
  description?: string;
}) => post<Resource>("/resources", body);

export const toggleResourceVisibility = (id: string) =>
  patch<Resource>(`/resources/${id}/visibility`);

export const deleteResource = (id: string) => del(`/resources/${id}`);

/* ---------------- Admins ---------------- */

export async function fetchAdmins(): Promise<AdminUser[]> {
  const data = await get<RawAdmin[]>("/admins");
  return data.map(normaliseAdmin);
}

export async function createAdmin(body: {
  name: string;
  email: string;
  password: string;
}): Promise<AdminUser> {
  return normaliseAdmin(await post<RawAdmin>("/admins", body));
}

export async function toggleAdmin(id: string): Promise<AdminUser> {
  return normaliseAdmin(await patch<RawAdmin>(`/admins/${id}/toggle`));
}
