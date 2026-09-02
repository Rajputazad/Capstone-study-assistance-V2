export type ResourceFileType = "PDF" | "ZIP" | "JPG";

export interface Resource {
  id: string;
  title: string;
  category: string;
  description: string;
  fileType: ResourceFileType;
  units: string[];
}

export const resources: Resource[] = [
  {
    id: "1",
    title: "AI Usage Guideline",
    category: "AI Guidelines",
    description:
      "Guidelines for ethical and responsible use of AI tools in your Capstone project.",
    fileType: "PDF",
    units: ["COS40005", "COS40006"],
  },
  {
    id: "2",
    title: "Capstone Submission Templates",
    category: "Templates",
    description: "All official submission templates for your Capstone deliverables.",
    fileType: "ZIP",
    units: ["COS40005", "COS40006"],
  },
  {
    id: "3",
    title: "Meeting Guide – Students",
    category: "Meeting Guide",
    description: "Visual guide for supervisor and client meetings.",
    fileType: "JPG",
    units: ["COS40005", "COS40006"],
  },
  {
    id: "4",
    title: "Other FAQ",
    category: "FAQ",
    description: "Frequently asked questions about Capstone requirements and processes.",
    fileType: "PDF",
    units: ["COS40005", "COS40006"],
  },
  {
    id: "5",
    title: "Professional Behaviour Guidelines – Client Meetings",
    category: "Professional Behaviour",
    description: "Expected conduct and communication standards when meeting with industry clients.",
    fileType: "PDF",
    units: ["COS40005", "COS40006"],
  },
  {
    id: "6",
    title: "Project A Revised",
    category: "Project Overview",
    description: "Updated Project A overview including scope, milestones, and deliverables.",
    fileType: "JPG",
    units: ["COS40005"],
  },
  {
    id: "7",
    title: "Project B – Semester 2 2026",
    category: "Project Overview",
    description: "Project B overview and key information for Semester 2 2026.",
    fileType: "JPG",
    units: ["COS40006"],
  },
  {
    id: "8",
    title: "Project B Weekly Plan",
    category: "Planning",
    description: "Week-by-week planning guide for Project B milestones and checkpoints.",
    fileType: "JPG",
    units: ["COS40006"],
  },
  {
    id: "9",
    title: "Sprint FAQ",
    category: "Agile / Scrum",
    description: "Frequently asked questions about Agile sprints in the Capstone context.",
    fileType: "PDF",
    units: ["COS40005", "COS40006"],
  },
];

export const unitFilters = ["All My Units", "COS40005", "COS40006"] as const;
export type UnitFilter = (typeof unitFilters)[number];

export const fileTypeFilters = ["All Types", "PDF", "ZIP", "JPG"] as const;
export type FileTypeFilter = (typeof fileTypeFilters)[number];
