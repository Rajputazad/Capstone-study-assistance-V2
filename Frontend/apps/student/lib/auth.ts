export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("student_auth_token");
}

export function setAuthToken(token: string): void {
  localStorage.setItem("student_auth_token", token);
}

export function clearAuthToken(): void {
  localStorage.removeItem("student_auth_token");
}
