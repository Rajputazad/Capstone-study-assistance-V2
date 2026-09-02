import type { Resource } from "@capstone/types";
import { apiFetch } from "./client";

interface ResourceQuery {
  unitCode?: string;
  search?: string;
  fileType?: string;
}

export function getStudentResources(query: ResourceQuery = {}): Promise<Resource[]> {
  const params = new URLSearchParams();
  if (query.unitCode) params.set("unitCode", query.unitCode);
  if (query.search) params.set("search", query.search);
  if (query.fileType) params.set("fileType", query.fileType);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return apiFetch<Resource[]>(`/students/me/resources${suffix}`);
}
