export type ResourceFileType = "PDF" | "ZIP" | "JPG";

export interface Resource {
  id: string;
  title: string;
  category: string;
  description: string;
  fileType: ResourceFileType;
  units: string[];
}
