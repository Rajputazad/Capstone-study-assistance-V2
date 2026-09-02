"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CloseIcon } from "@/components/icons";
import { unitCatalog } from "@/lib/user-data";
import { useStudent } from "@/lib/student-context";

interface RequestUnitAccessModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function RequestUnitAccessModal({
  open,
  onClose,
  onSuccess,
  onError,
}: RequestUnitAccessModalProps) {
  const { approvedUnitCodes, pendingRequests, requestUnitAccess } = useStudent();
  const [selectedUnitCode, setSelectedUnitCode] = useState("");
  const [reason, setReason] = useState("");

  const availableUnits = useMemo(() => {
    const blockedCodes = new Set([
      ...approvedUnitCodes,
      ...pendingRequests.map((request) => request.unitCode),
    ]);

    return unitCatalog.filter((unit) => !blockedCodes.has(unit.code));
  }, [approvedUnitCodes, pendingRequests]);

  useEffect(() => {
    if (!open) {
      setSelectedUnitCode("");
      setReason("");
    }
  }, [open]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = requestUnitAccess(selectedUnitCode, reason.trim() || undefined);

    if (result.ok) {
      onSuccess("Request sent to your professor for approval.");
      onClose();
      return;
    }

    onError(result.message);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close request unit access dialog"
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-unit-access-title"
        className="relative z-10 w-full max-w-[440px] rounded-[12px] border border-figma-border bg-white p-6 shadow-lg"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="request-unit-access-title" className="text-[18px] font-bold text-gray-900">
              Request Unit Access
            </h2>
            <p className="mt-1.5 text-[13px] leading-snug text-gray-500">
              Select an additional unit you would like access to. Your request will be reviewed by
              an administrator.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-[6px] p-1 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <p className="mb-2.5 text-[13px] font-semibold text-gray-900">Select Unit</p>
            {availableUnits.length > 0 ? (
              <div className="space-y-2.5">
                {availableUnits.map((unit) => {
                  const selected = selectedUnitCode === unit.code;

                  return (
                    <label
                      key={unit.code}
                      className={`flex cursor-pointer items-start gap-3 rounded-[10px] border px-4 py-3.5 transition-colors ${
                        selected
                          ? "border-capstone-red bg-capstone-red-light/40"
                          : "border-figma-border bg-white hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="unit-code"
                        value={unit.code}
                        checked={selected}
                        onChange={() => setSelectedUnitCode(unit.code)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-capstone-red"
                      />
                      <span className="min-w-0">
                        <span className="block text-[14px] font-bold text-gray-900">{unit.code}</span>
                        <span className="mt-0.5 block text-[13px] text-gray-500">
                          {unit.code} - {unit.name}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-[10px] border border-figma-border bg-gray-50 px-4 py-3 text-[13px] text-gray-500">
                You already have requests pending for all available units.
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="request-reason"
              className="mb-2.5 block text-[13px] font-semibold text-gray-900"
            >
              Reason (optional)
            </label>
            <textarea
              id="request-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              placeholder="e.g. I am enrolled in the continuation unit and need access to Project B resources."
              className="w-full resize-none rounded-[10px] border border-figma-border px-3.5 py-3 text-[13px] text-gray-900 placeholder:text-gray-400 focus:border-capstone-red focus:outline-none focus:ring-1 focus:ring-capstone-red"
            />
          </div>

          <button
            type="submit"
            disabled={!selectedUnitCode}
            className="w-full rounded-[10px] px-4 py-3 text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-[#E5E7EB] disabled:text-[#9CA3AF] enabled:bg-capstone-red enabled:text-white enabled:hover:bg-capstone-red-dark"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}
