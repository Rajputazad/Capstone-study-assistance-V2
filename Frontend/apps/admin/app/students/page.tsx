"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminShell from "@/components/AdminShell";
import { Icon } from "@/components/Icons";

import {
  StatusBadge,
  UnitBadge,
} from "@/components/Badge";

import {
  fetchStudents,
  grantUnit,
  revokeUnit,
} from "@/lib/api";

import type {
  Student,
} from "@/lib/types";

const allUnits = [
  {
    code: "COS40005",
    title:
      "Computing Technology Project A",
  },
  {
    code: "COS40006",
    title:
      "Computing Technology Project B",
  },
  {
    code: "EAT40005",
    title:
      "Engineering Technology Project A",
  },
  {
    code: "EAT40006",
    title:
      "Engineering Technology Project B",
  },
];

export default function Students() {
  const [rows, setRows] =
    useState<Student[]>([]);

  const [error, setError] =
    useState("");

  useEffect(() => {
    fetchStudents()
      .then(setRows)
      .catch((err) =>
        setError(err.message)
      );
  }, []);

  const [search, setSearch] =
    useState("");

  const [
    selectedStudent,
    setSelectedStudent,
  ] =
    useState<Student | null>(
      null
    );


  const filtered =
    useMemo(
      () =>
        rows.filter(
          (student) =>
            `${student.name} ${student.studentId} ${student.email}`
              .toLowerCase()
              .includes(
                search.toLowerCase()
              )
        ),
      [rows, search]
    );

  function updateStudent(
    updated: Student
  ) {
    setSelectedStudent(
      updated
    );

    setRows((current) =>
      current.map((student) =>
        student.id === updated.id
          ? updated
          : student
      )
    );
  }

  async function removeUnit(
    code: string
  ) {
    if (!selectedStudent) {
      return;
    }

    try {
      const updated =
        await revokeUnit(
          selectedStudent.id,
          code
        );

      updateStudent(updated);
    } catch (err) {
      setError(
        (err as Error).message
      );
    }
  }

  async function addUnit(
    code: string
  ) {
    if (!selectedStudent) {
      return;
    }

    if (
      selectedStudent
        .approvedUnits
        .includes(code)
    ) {
      return;
    }

    try {
      const updated =
        await grantUnit(
          selectedStudent.id,
          code
        );

      updateStudent(updated);
    } catch (err) {
      setError(
        (err as Error).message
      );
    }
  }

  const availableUnits =
    selectedStudent
      ? allUnits.filter(
          (unit) =>
            !selectedStudent
              .approvedUnits
              .includes(
                unit.code
              )
        )
      : [];

  return (
    <AdminShell>
      <div className="page">
        <h1 className="pageTitle">
          Students
        </h1>

        <p className="pageSub">
          {rows.length} students registered
        </p>

        {error && (
          <p className="loginError">
            {error}
          </p>
        )}

        <div className="tablePanel">
          <div className="searchRow">
            <div className="searchWrap">
              <Icon
                name="search"
                size={22}
              />

              <input
                className="searchBox"
                placeholder="Search students..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>STUDENT</th>
                <th>STUDENT ID</th>
                <th>EMAIL</th>
                <th>
                  APPROVED UNITS
                </th>
                <th>PENDING</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(
                (student) => (
                  <tr
                    key={
                      student.id
                    }
                  >
                    <td>
                      <div className="studentCell">
                        <div className="miniAvatar">
                          {
                            student
                              .name[0]
                          }
                        </div>

                        {
                          student.name
                        }
                      </div>
                    </td>

                    <td>
                      {
                        student.studentId
                      }
                    </td>

                    <td>
                      {
                        student.email
                      }
                    </td>

                    <td>
                      <div className="unitList">
                        {student.approvedUnits.map(
                          (unit) => (
                            <UnitBadge
                              key={
                                unit
                              }
                            >
                              {unit}
                            </UnitBadge>
                          )
                        )}
                      </div>
                    </td>

                    <td>
                      {student
                        .pendingUnits
                        .length ? (
                        <div className="unitList">
                          {student.pendingUnits.map(
                            (
                              unit
                            ) => (
                              <UnitBadge
                                pending
                                key={
                                  unit
                                }
                              >
                                {
                                  unit
                                }
                              </UnitBadge>
                            )
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>
                      <StatusBadge
                        value={
                          student.status
                        }
                      />
                    </td>

                    <td>
                      <button
                        type="button"
                        className="actionLink"
                        onClick={() =>
                          setSelectedStudent(
                            {
                              ...student,
                            }
                          )
                        }
                      >
                        Manage Units
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {selectedStudent && (
          <div
            className="modalBackdrop"
            onMouseDown={() =>
              setSelectedStudent(
                null
              )
            }
          >
            <div
              className="figManageModal"
              onMouseDown={(
                event
              ) =>
                event.stopPropagation()
              }
            >
              <div className="figModalHead">
                <h2>
                  Manage Units –{" "}
                  {
                    selectedStudent.name
                  }
                </h2>

                <button
                  className="modalX"
                  type="button"
                  onClick={() =>
                    setSelectedStudent(
                      null
                    )
                  }
                >
                  ×
                </button>
              </div>

              <div className="figManageBody">
                <p className="studentInfo">
                  Student ID:{" "}
                  {
                    selectedStudent.studentId
                  }{" "}
                  ·{" "}
                  {
                    selectedStudent.email
                  }
                </p>

                <h3>
                  Approved Units
                </h3>

                <div className="approvedStack">
                  {selectedStudent.approvedUnits.map(
                    (code) => {
                      const unit =
                        allUnits.find(
                          (item) =>
                            item.code ===
                            code
                        );

                      return (
                        <div
                          className="approvedUnitRow"
                          key={code}
                        >
                          <div>
                            <strong>
                              {code}
                            </strong>

                            <span>
                              {code} –{" "}
                              {
                                unit?.title
                              }
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeUnit(
                                code
                              )
                            }
                          >
                            Remove
                          </button>
                        </div>
                      );
                    }
                  )}
                </div>

                <h3 className="addUnitHeading">
                  Add Unit Access
                </h3>

                <div className="availableStack">
                  {availableUnits.map(
                    (unit) => (
                      <div
                        className="availableUnitRow"
                        key={
                          unit.code
                        }
                      >
                        <div>
                          <strong>
                            {
                              unit.code
                            }
                          </strong>

                          <span>
                            {
                              unit.code
                            }{" "}
                            –{" "}
                            {
                              unit.title
                            }
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            addUnit(
                              unit.code
                            )
                          }
                        >
                          <b>＋</b> Add
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}