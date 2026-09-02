import type { Assignment } from "@capstone/types";
import { apiFetch } from "./client";

export function getStudentAssignments(unitCode?: string): Promise<Assignment[]> {
  const query = unitCode ? `?unitCode=${encodeURIComponent(unitCode)}` : "";
  return apiFetch<Assignment[]>(`/students/me/assignments${query}`);
}
