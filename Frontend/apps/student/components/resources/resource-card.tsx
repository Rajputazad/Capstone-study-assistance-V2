import type { Resource, ResourceFileType } from "@/lib/resources-data";
import { DownloadIcon, ViewIcon } from "@/components/icons";

const badgeStyles: Record<ResourceFileType, string> = {
  PDF: "bg-[#FEE2E2] text-[#B91C1C]",
  ZIP: "bg-[#FFEDD5] text-[#C2410C]",
  JPG: "bg-[#DBEAFE] text-[#1D4ED8]",
};

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <article className="flex flex-col rounded-[12px] border border-figma-border bg-white p-4 shadow-card">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-[13px] font-semibold leading-snug text-gray-900">{resource.title}</h3>
        <span
          className={`shrink-0 rounded-[4px] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${badgeStyles[resource.fileType]}`}
        >
          {resource.fileType}
        </span>
      </div>

      <p className="mb-1 text-[11px] font-medium text-gray-500">{resource.category}</p>
      <p className="mb-3 flex-1 text-[12px] leading-[1.5] text-gray-600">{resource.description}</p>

      <div className="mb-3 flex flex-wrap gap-1">
        {resource.units.map((unit) => (
          <span
            key={unit}
            className="rounded-full bg-capstone-red-chip px-2 py-[1px] text-[9px] font-semibold text-capstone-red"
          >
            {unit}
          </span>
        ))}
      </div>

      <div className="mt-auto flex gap-2 border-t border-figma-border pt-3">
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1 rounded-[8px] border border-figma-border py-1.5 text-[11px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <ViewIcon />
          View
        </button>
        <button
          type="button"
          className="flex flex-1 items-center justify-center gap-1 rounded-[8px] border border-figma-border py-1.5 text-[11px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <DownloadIcon />
          Download
        </button>
      </div>
    </article>
  );
}
