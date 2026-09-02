"use client";

import { useMemo, useState } from "react";
import {
  fileTypeFilters,
  resources,
  unitFilters,
  type FileTypeFilter,
  type UnitFilter,
} from "@/lib/resources-data";
import { ChevronDownIcon, SearchIcon } from "@/components/icons";
import { useStudent } from "@/lib/student-context";
import { ResourceCard } from "./resource-card";

export function UnitResourcesPage() {
  const { approvedUnitCodes } = useStudent();
  const [search, setSearch] = useState("");
  const [unitFilter, setUnitFilter] = useState<UnitFilter>("All My Units");
  const [typeFilter, setTypeFilter] = useState<FileTypeFilter>("All Types");

  const availableUnitFilters = unitFilters.filter(
    (unit) => unit === "All My Units" || approvedUnitCodes.includes(unit),
  );

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const isApproved = resource.units.some((unit) => approvedUnitCodes.includes(unit));
      if (!isApproved) return false;

      const matchesSearch =
        search.trim() === "" ||
        resource.title.toLowerCase().includes(search.toLowerCase()) ||
        resource.category.toLowerCase().includes(search.toLowerCase()) ||
        resource.description.toLowerCase().includes(search.toLowerCase());

      const matchesUnit =
        unitFilter === "All My Units" ||
        (resource.units.includes(unitFilter) && approvedUnitCodes.includes(unitFilter));

      const matchesType =
        typeFilter === "All Types" || resource.fileType === typeFilter;

      return matchesSearch && matchesUnit && matchesType;
    });
  }, [approvedUnitCodes, search, unitFilter, typeFilter]);

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-white">
      <div className="border-b border-figma-border px-6 py-5">
        <h1 className="text-[22px] font-bold text-gray-900">Unit Resources</h1>
        <p className="mt-0.5 text-[13px] text-gray-500">
          Resources approved for your enrolled units
        </p>

        <div className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search resources..."
              className="w-full rounded-[8px] border border-figma-border bg-white py-2 pl-9 pr-3 text-[13px] text-gray-900 placeholder:text-gray-400 focus:border-capstone-red focus:outline-none focus:ring-1 focus:ring-capstone-red"
            />
          </div>

          <div className="relative w-[120px] shrink-0">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as FileTypeFilter)}
              className="w-full appearance-none rounded-[8px] border border-figma-border bg-white py-2 pl-3 pr-8 text-[13px] text-gray-700 focus:border-capstone-red focus:outline-none focus:ring-1 focus:ring-capstone-red"
            >
              {fileTypeFilters.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {approvedUnitCodes.length > 0 ? (
          <div className="mt-3 flex gap-1.5">
            {availableUnitFilters.map((unit) => {
              const active = unitFilter === unit;
              return (
                <button
                  key={unit}
                  type="button"
                  onClick={() => setUnitFilter(unit)}
                  className={`rounded-full px-3 py-1 text-[12px] font-semibold transition-colors ${
                    active
                      ? "bg-capstone-red text-white"
                      : "border border-capstone-red bg-white text-capstone-red hover:bg-capstone-red-light"
                  }`}
                >
                  {unit}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="bg-figma-page px-6 py-5">
        {approvedUnitCodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[13px] font-medium text-gray-900">No approved units</p>
            <p className="mt-1 text-[13px] text-gray-500">
              Request access from Profile. Resources appear after professor approval.
            </p>
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-[13px] font-medium text-gray-900">No resources found</p>
            <p className="mt-1 text-[13px] text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
