import type { ReactNode } from "react";

export function UnitBadge({
  children,
  pending = false,
}: {
  children: ReactNode;
  pending?: boolean;
}) {
  return (
    <span className={pending ? "unitBadge pendingUnit" : "unitBadge"}>
      {children}
    </span>
  );
}

export function StatusBadge({
  value,
}: {
  value: string;
}) {
  const className = value
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <span className={`statusBadge ${className}`}>
      <span className="statusDot" />
      {value}
    </span>
  );
}