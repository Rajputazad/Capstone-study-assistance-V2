export type AssignmentStatus = "draft" | "published" | "closed";

export interface Assignment {
  id: string;
  unitCode: string;
  title: string;
  description: string;
  dueDate: string;
  required: boolean;
  status: AssignmentStatus;
}

export type UnitAccessRequestStatus = "pending" | "approved" | "rejected";

export interface UnitAccessRequest {
  id: string;
  unitCode: string;
  status: UnitAccessRequestStatus;
  requestedAt: string;
}
