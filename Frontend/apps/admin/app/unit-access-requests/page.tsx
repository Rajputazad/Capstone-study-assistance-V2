"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminShell from "@/components/AdminShell";

import {
  StatusBadge,
  UnitBadge,
} from "@/components/Badge";

import {
  decideRequest,
  fetchRequests,
} from "@/lib/api";

import type {
  RequestStatus,
  UnitAccessRequest,
} from "@/lib/types";

export default function Requests() {
  const [rows, setRows] =
    useState<UnitAccessRequest[]>([]);

  const [error, setError] =
    useState("");

  useEffect(() => {
    fetchRequests()
      .then(setRows)
      .catch((err) =>
        setError(err.message)
      );
  }, []);

  const [tab, setTab] =
    useState<
      "All" | RequestStatus
    >("All");

 

  const counts = {
    All: rows.length,

    Pending:
      rows.filter(
        (request) =>
          request.status ===
          "Pending"
      ).length,

    Approved:
      rows.filter(
        (request) =>
          request.status ===
          "Approved"
      ).length,

    Rejected:
      rows.filter(
        (request) =>
          request.status ===
          "Rejected"
      ).length,
  };

  const filtered =
    useMemo(
      () =>
        tab === "All"
          ? rows
          : rows.filter(
              (request) =>
                request.status ===
                tab
            ),
      [rows, tab]
    );

  async function setStatus(
    id: string,
    status: Exclude<
      RequestStatus,
      "Pending"
    >
  ) {
    try {
      const updated =
        await decideRequest(
          id,
          status
        );

      setRows((current) =>
        current.map(
          (request) =>
            request.id === id
              ? updated
              : request
        )
      );
    } catch (err) {
      setError(
        (err as Error).message
      );
    }
  }

  return (
    <AdminShell>
      <div className="page narrow">
        <h1 className="pageTitle">
          Unit Access Requests
        </h1>

        <p className="pageSub">
          Review and manage student unit access requests
        </p>

        <div className="requestTabs">
          {(
            [
              "All",
              "Pending",
              "Approved",
              "Rejected",
            ] as const
          ).map(
            (item) => (
              <button
                key={item}
                type="button"
                className={`requestTab ${
                  tab === item
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setTab(item)
                }
              >
                {item}{" "}
                <span>
                  {
                    counts[
                      item
                    ]
                  }
                </span>
              </button>
            )
          )}
        </div>

        {filtered.map(
          (request) => (
            <div
              className="requestCard"
              key={request.id}
            >
              <div className="avatar">
                {request.name[0]}
              </div>

              <div className="requestCardBody">
                <div className="requestCardTop">
                  <span className="requestCardName">
                    {
                      request.name
                    }
                  </span>

                  <StatusBadge
                    value={
                      request.status
                    }
                  />
                </div>

                <div className="requestCardMeta">
                  ID:{" "}
                  {
                    request.studentId
                  }{" "}
                  · Requested{" "}
                  {
                    request.requestedAt
                  }
                </div>

                <div className="currentRow">
                  <span>
                    Current:
                  </span>

                  {request.currentUnits.map(
                    (unit) => (
                      <UnitBadge
                        key={unit}
                      >
                        {unit}
                      </UnitBadge>
                    )
                  )}

                  <span>
                    → Requesting:
                  </span>

                  <UnitBadge>
                    {
                      request.requestingUnit
                    }
                  </UnitBadge>
                </div>

                <div className="reason">
                  &quot;
                  {request.reason}
                  &quot;
                </div>
              </div>

              {request.status ===
                "Pending" && (
                <div
                  style={{
                    display:
                      "flex",
                    gap: 12,
                  }}
                >
                  <button
                    type="button"
                    className="approveBtn"
                    onClick={() =>
                      setStatus(
                        request.id,
                        "Approved"
                      )
                    }
                  >
                    ✓　Approve Access
                  </button>

                  <button
                    type="button"
                    className="rejectBtn"
                    onClick={() =>
                      setStatus(
                        request.id,
                        "Rejected"
                      )
                    }
                  >
                    ✕　Reject
                  </button>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </AdminShell>
  );
}