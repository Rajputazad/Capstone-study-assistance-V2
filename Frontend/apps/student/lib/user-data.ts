export interface ApprovedUnit {
  code: string;
  name: string;
  status: "Approved";
}

export interface PendingUnitRequest {
  id: string;
  unitCode: string;
  unitName: string;
  reason?: string;
  requestedAt: string;
  status: "pending";
}

export interface StudentProfile {
  name: string;
  email: string;
  studentId: string;
  initials: string;
}

export interface StudentChat {
  id: string;
  title: string;
  unitCode: string;
  date: string;
}

export interface UnitCatalogEntry {
  code: string;
  name: string;
}

export const studentProfile: StudentProfile = {
  name: "Jordan Tan",
  email: "jordan.tan@student.edu.au",
  studentId: "104123456",
  initials: "J",
};

export const initialApprovedUnits: ApprovedUnit[] = [
  {
    code: "COS40005",
    name: "Computing Technology Project A",
    status: "Approved",
  },
  {
    code: "COS40006",
    name: "Computing Technology Project B",
    status: "Approved",
  },
];

export const unitCatalog: UnitCatalogEntry[] = [
  { code: "COS40005", name: "Computing Technology Project A" },
  { code: "COS40006", name: "Computing Technology Project B" },
  { code: "COS40007", name: "Computing Technology Project C" },
  { code: "EAT40005", name: "Engineering Technology Project A" },
  { code: "EAT40006", name: "Engineering Technology Project B" },
];

export const initialChats: StudentChat[] = [
  { id: "1", title: "Week 1 tasks", unitCode: "COS40005", date: "Today" },
  { id: "2", title: "Supervisor meeting prep", unitCode: "COS40005", date: "Yesterday" },
  { id: "3", title: "Passive contributor issue", unitCode: "COS40006", date: "17 Aug" },
  { id: "4", title: "Submission templates", unitCode: "COS40006", date: "15 Aug" },
];

export function getUnitName(code: string): string {
  return unitCatalog.find((unit) => unit.code === code)?.name ?? code;
}
