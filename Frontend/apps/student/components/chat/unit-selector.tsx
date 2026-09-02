"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import type { ApprovedUnit } from "@/lib/user-data";

interface UnitSelectorProps {
  units: ApprovedUnit[];
  value: string;
  onChange: (unitCode: string) => void;
  placeholder?: string;
}

export function UnitSelector({
  units,
  value,
  onChange,
  placeholder = "Select an approved unit...",
}: UnitSelectorProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = units.find((unit) => unit.code === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative mt-3 max-w-md">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-[8px] border border-figma-border bg-white px-3 py-2.5 text-left shadow-sm transition-colors hover:border-capstone-red"
      >
        <span className={`text-[13px] ${selected ? "font-medium text-gray-900" : "text-gray-400"}`}>
          {selected ? `${selected.code} — ${selected.name}` : placeholder}
        </span>
        <ChevronDownIcon
          className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-[8px] border border-figma-border bg-white py-1 shadow-lg">
          {units.map((unit) => {
            const isSelected = unit.code === value;
            return (
              <li key={unit.code}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(unit.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-capstone-red-light ${
                    isSelected ? "bg-capstone-red-light" : ""
                  }`}
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      isSelected ? "bg-capstone-red" : "bg-transparent"
                    }`}
                  />
                  <span>
                    <span className="block text-[13px] font-semibold text-gray-900">{unit.code}</span>
                    <span className="block text-[11px] text-gray-500">{unit.name}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
