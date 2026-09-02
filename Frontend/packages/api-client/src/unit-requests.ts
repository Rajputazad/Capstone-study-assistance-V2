import type { UnitAccessRequest } from "@capstone/types";
import { apiFetch } from "./client";

export function getUnitAccessRequests(): Promise<UnitAccessRequest[]> {
  return apiFetch<UnitAccessRequest[]>("/students/me/unit-requests");
}

export function requestUnitAccess(unitCode: string): Promise<UnitAccessRequest> {
  return apiFetch<UnitAccessRequest>("/students/me/unit-requests", {
    method: "POST",
    body: JSON.stringify({ unitCode }),
  });
}
