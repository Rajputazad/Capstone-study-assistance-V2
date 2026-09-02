import type { User } from "@capstone/types";
import { apiFetch } from "./client";

export function getStudents(): Promise<User[]> {
  return apiFetch<User[]>("/students");
}

export function getStudent(id: string): Promise<User> {
  return apiFetch<User>(`/students/${id}`);
}
