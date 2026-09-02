import type { Course } from "@capstone/types";
import { apiFetch } from "./client";

export function getCourses(): Promise<Course[]> {
  return apiFetch<Course[]>("/courses");
}

export function getCourse(id: string): Promise<Course> {
  return apiFetch<Course>(`/courses/${id}`);
}
