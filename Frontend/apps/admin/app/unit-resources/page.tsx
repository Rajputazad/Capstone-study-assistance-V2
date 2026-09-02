"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AdminShell from "../../components/AdminShell";
import { Icon } from "../../components/Icons";

import {
  StatusBadge,
  UnitBadge,
} from "../../components/Badge";

import {
  createResource,
  deleteResource as deleteResourceApi,
  fetchResources,
  toggleResourceVisibility,
} from "../../lib/api";

import type {
  Resource,
} from "../../lib/types";

/* =====================================================
   AVAILABLE UNITS
===================================================== */

const unitOptions = [
  {
    code: "COS40005",
    name: "Computing Technology Project A",
  },
  {
    code: "COS40006",
    name: "Computing Technology Project B",
  },
  {
    code: "EAT40005",
    name: "Engineering Technology Project A",
  },
  {
    code: "EAT40006",
    name: "Engineering Technology Project B",
  },
];

/* =====================================================
   RESOURCE CATEGORIES
===================================================== */

const categoryOptions = [
  "Getting Started",
  "AI Guidelines",
  "Submission Templates",
  "Meetings",
  "FAQs",
  "Professional Behaviour",
  "Project A",
  "Project B",
];

/* =====================================================
   AUTOMATIC FILE TYPE
===================================================== */

function detectFileType(
  filename: string
) {
  const extension =
    filename
      .split(".")
      .pop()
      ?.toUpperCase();

  if (!extension) {
    return "FILE";
  }

  if (extension === "JPEG") {
    return "JPG";
  }

  return extension;
}

/* =====================================================
   PAGE
===================================================== */

export default function Resources() {
  /* ===================================================
     RESOURCE TABLE
  =================================================== */

  const [rows, setRows] =
    useState<Resource[]>([]);

  const [loadError, setLoadError] =
    useState("");

  useEffect(() => {
    fetchResources()
      .then(setRows)
      .catch((err) =>
        setLoadError(err.message)
      );
  }, []);

  const [search, setSearch] =
    useState("");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState(
    "All Categories"
  );

  /* ===================================================
     UPLOAD MODAL
  =================================================== */

  const [
    showUpload,
    setShowUpload,
  ] = useState(false);

  const [title, setTitle] =
    useState("");

  const [
    category,
    setCategory,
  ] = useState(
    "Getting Started"
  );

  const [
    selectedUnits,
    setSelectedUnits,
  ] = useState<string[]>(
    []
  );

  const [
    description,
    setDescription,
  ] = useState("");

  const [file, setFile] =
    useState<File | null>(
      null
    );

  const [error, setError] =
    useState("");

  /* ===================================================
     FILTER CATEGORIES
  =================================================== */

  const categories = [
    "All Categories",

    ...Array.from(
      new Set(
        rows.map(
          (resource) =>
            resource.category
        )
      )
    ),
  ];

  /* ===================================================
     SEARCH + FILTER
  =================================================== */

  const filteredResources =
    useMemo(() => {
      return rows.filter(
        (resource) => {
          const matchesCategory =
            categoryFilter ===
              "All Categories" ||
            resource.category ===
              categoryFilter;

          const searchText =
            `${resource.title} ${resource.filename} ${resource.category}`
              .toLowerCase();

          const matchesSearch =
            searchText.includes(
              search
                .toLowerCase()
                .trim()
            );

          return (
            matchesCategory &&
            matchesSearch
          );
        }
      );
    }, [
      rows,
      search,
      categoryFilter,
    ]);

  /* ===================================================
     SELECT / UNSELECT UNITS
  =================================================== */

  function toggleUnit(
    unitCode: string
  ) {
    setSelectedUnits(
      (current) => {
        if (
          current.includes(
            unitCode
          )
        ) {
          return current.filter(
            (unit) =>
              unit !==
              unitCode
          );
        }

        return [
          ...current,
          unitCode,
        ];
      }
    );
  }

  /* ===================================================
     RESET UPLOAD FORM
  =================================================== */

  function resetUploadForm() {
    setTitle("");

    setCategory(
      "Getting Started"
    );

    setSelectedUnits([]);

    setDescription("");

    setFile(null);

    setError("");
  }

  /* ===================================================
     CLOSE MODAL
  =================================================== */

  function closeUploadModal() {
    resetUploadForm();

    setShowUpload(false);
  }

  /* ===================================================
     UPLOAD RESOURCE
  =================================================== */

  async function uploadResource() {
    setError("");

    if (!title.trim()) {
      setError(
        "Please enter a resource title."
      );

      return;
    }

    if (!file) {
      setError(
        "Please choose a file."
      );

      return;
    }

    if (
      selectedUnits.length ===
      0
    ) {
      setError(
        "Please assign at least one unit."
      );

      return;
    }

    try {
      const created =
        await createResource({
          title: title.trim(),

          filename: file.name,

          units: selectedUnits,

          category,

          type: detectFileType(
            file.name
          ),

          description:
            description.trim(),
        });

      setRows(
        (current) => [
          created,
          ...current,
        ]
      );

      closeUploadModal();
    } catch (err) {
      setError(
        (err as Error).message
      );
    }
  }

  /* ===================================================
     SHOW / HIDE RESOURCE
  =================================================== */

  async function toggleVisibility(
    id: string
  ) {
    try {
      const updated =
        await toggleResourceVisibility(
          id
        );

      setRows((current) =>
        current.map(
          (resource) =>
            resource.id === id
              ? updated
              : resource
        )
      );
    } catch (err) {
      setLoadError(
        (err as Error).message
      );
    }
  }

  /* ===================================================
     DELETE RESOURCE
  =================================================== */

  async function deleteResource(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this resource?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteResourceApi(id);

      setRows((current) =>
        current.filter(
          (resource) =>
            resource.id !== id
        )
      );
    } catch (err) {
      setLoadError(
        (err as Error).message
      );
    }
  }

  /* ===================================================
     VIEW RESOURCE
  =================================================== */

  function viewResource(
    resource: Resource
  ) {
    alert(
      `${resource.title}\n\nFile: ${resource.filename}`
    );
  }

  /* ===================================================
     EDIT RESOURCE
  =================================================== */

  function editResource(
    resource: Resource
  ) {
    alert(
      `Edit functionality for "${resource.title}" will be connected later.`
    );
  }

  /* ===================================================
     PAGE UI
  =================================================== */

  return (
    <AdminShell>
      <div className="page">
        {/* =============================================
            PAGE HEADER
        ============================================== */}

        <div className="resourceTop">
          <div>
            <h1 className="pageTitle">
              Unit Resources
            </h1>

            <p
              className="pageSub"
              style={{
                marginBottom: 0,
              }}
            >
              24 resources · manage
              visibility, categories
              and unit assignment
            </p>
          </div>

          <button
            type="button"
            className="uploadBtn"
            onClick={() =>
              setShowUpload(true)
            }
          >
            <Icon
              name="upload"
              size={22}
            />

            Upload Resource
          </button>
        </div>

        {/* =============================================
            SEARCH + CATEGORY FILTER
        ============================================== */}

        <div className="resourceFilters">
          <div
            className="searchWrap"
            style={{
              display: "block",
            }}
          >
            <Icon
              name="search"
              size={22}
            />

            <input
              className="bigSearch"
              placeholder="Search resources..."
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>

          <select
            className="filterSelect"
            value={
              categoryFilter
            }
            onChange={(
              event
            ) =>
              setCategoryFilter(
                event.target.value
              )
            }
          >
            {categories.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>
        </div>

        {/* =============================================
            RESOURCE TABLE
        ============================================== */}

        <div className="tablePanel">
          <table>
            <thead>
              <tr>
                <th>
                  RESOURCE
                </th>

                <th>
                  UNIT(S)
                </th>

                <th>
                  CATEGORY
                </th>

                <th>
                  TYPE
                </th>

                <th>
                  VISIBILITY
                </th>

                <th>
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredResources.map(
                (resource) => (
                  <tr
                    key={
                      resource.id
                    }
                  >
                    {/* RESOURCE */}

                    <td>
                      <div
                        style={{
                          fontWeight:
                            700,

                          color:
                            "#111827",

                          fontSize:
                            17,
                        }}
                      >
                        {
                          resource.title
                        }
                      </div>

                      <div
                        style={{
                          color:
                            "#9aa3b6",

                          fontSize:
                            14,

                          marginTop:
                            3,
                        }}
                      >
                        {
                          resource.filename
                        }
                      </div>
                    </td>

                    {/* UNITS */}

                    <td>
                      <div className="unitList">
                        {resource.units.map(
                          (
                            unit
                          ) => (
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

                    {/* CATEGORY */}

                    <td>
                      {
                        resource.category
                      }
                    </td>

                    {/* FILE TYPE */}

                    <td>
                      <span
                        className={`typeBadge ${resource.type.toLowerCase()}`}
                      >
                        {
                          resource.type
                        }
                      </span>
                    </td>

                    {/* VISIBILITY */}

                    <td>
                      <StatusBadge
                        value={
                          resource.visible
                            ? "Visible"
                            : "Hidden"
                        }
                      />
                    </td>

                    {/* ACTIONS */}

                    <td>
                      <div className="resourceActions">
                        {/* VIEW */}

                        <button
                          type="button"
                          className="iconButton"
                          title="View"
                          onClick={() =>
                            viewResource(
                              resource
                            )
                          }
                        >
                          <Icon
                            name="eye"
                            size={20}
                          />
                        </button>

                        {/* EDIT */}

                        <button
                          type="button"
                          className="iconButton"
                          title="Edit"
                          onClick={() =>
                            editResource(
                              resource
                            )
                          }
                        >
                          <Icon
                            name="edit"
                            size={20}
                          />
                        </button>

                        {/* SHOW / HIDE */}

                        <button
                          type="button"
                          className="iconButton"
                          title={
                            resource.visible
                              ? "Hide"
                              : "Show"
                          }
                          onClick={() =>
                            toggleVisibility(
                              resource.id
                            )
                          }
                        >
                          <Icon
                            name="hide"
                            size={20}
                          />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          className="iconButton"
                          title="Delete"
                          onClick={() =>
                            deleteResource(
                              resource.id
                            )
                          }
                        >
                          <Icon
                            name="trash"
                            size={20}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}

              {/* NO RESULTS */}

              {filteredResources.length ===
                0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign:
                        "center",

                      padding:
                        "40px",

                      color:
                        "#98a2b3",
                    }}
                  >
                    No resources
                    found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* =============================================
            UPLOAD RESOURCE MODAL
        ============================================== */}

        {showUpload && (
          <div
            className="modalBackdrop"
            onMouseDown={
              closeUploadModal
            }
          >
            <div
              className="figUploadModal"
              onMouseDown={(
                event
              ) =>
                event.stopPropagation()
              }
            >
              {/* MODAL HEADER */}

              <div className="figModalHead">
                <h2>
                  Upload Resource
                </h2>

                <button
                  type="button"
                  className="modalX"
                  onClick={
                    closeUploadModal
                  }
                >
                  ×
                </button>
              </div>

              {/* MODAL CONTENT */}

              <div className="figUploadBody">
                {/* RESOURCE TITLE */}

                <div className="figField">
                  <label>
                    Resource Title *
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Week 1 Student To-Do"
                    value={title}
                    onChange={(
                      event
                    ) =>
                      setTitle(
                        event
                          .target
                          .value
                      )
                    }
                  />
                </div>

                {/* FILE */}

                <div className="figField">
                  <label>
                    File / Filename *
                  </label>

                  <label className="fileInputVisual">
                    <span>
                      {file
                        ? file.name
                        : "Choose a file"}
                    </span>

                    <input
                      type="file"
                      accept=".pdf,.zip,.jpg,.jpeg,.png,.doc,.docx,.ppt,.pptx"
                      onChange={(
                        event
                      ) =>
                        setFile(
                          event
                            .target
                            .files?.[0] ??
                            null
                        )
                      }
                    />
                  </label>
                </div>

                {/*
                  IMPORTANT:

                  There is NO
                  File Type field.

                  File type is detected
                  automatically from
                  file.name.
                */}

                {/* CATEGORY */}

                <div className="figField">
                  <label>
                    Category
                  </label>

                  <select
                    value={
                      category
                    }
                    onChange={(
                      event
                    ) =>
                      setCategory(
                        event
                          .target
                          .value
                      )
                    }
                  >
                    {categoryOptions.map(
                      (
                        item
                      ) => (
                        <option
                          key={
                            item
                          }
                          value={
                            item
                          }
                        >
                          {item}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* ASSIGN UNITS */}

                <div className="figField">
                  <label>
                    Assign Unit(s) *
                  </label>

                  <div className="figUnitGrid">
                    {unitOptions.map(
                      (unit) => (
                        <label
                          key={
                            unit.code
                          }
                          className="figUnitChoice"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUnits.includes(
                              unit.code
                            )}
                            onChange={() =>
                              toggleUnit(
                                unit.code
                              )
                            }
                          />

                          <div>
                            <strong>
                              {
                                unit.code
                              }
                            </strong>

                            <span>
                              {
                                unit.name
                              }
                            </span>
                          </div>
                        </label>
                      )
                    )}
                  </div>
                </div>

                {/* DESCRIPTION */}

                <div className="figField">
                  <label>
                    Description
                  </label>

                  <textarea
                    placeholder="Brief description of this resource..."
                    value={
                      description
                    }
                    onChange={(
                      event
                    ) =>
                      setDescription(
                        event
                          .target
                          .value
                      )
                    }
                  />
                </div>

                {/* ERROR */}

                {error && (
                  <div className="formError">
                    {error}
                  </div>
                )}
              </div>

              {/* MODAL FOOTER */}

              <div className="figModalFooter">
                <button
                  type="button"
                  className="figCancelBtn"
                  onClick={
                    closeUploadModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="figPrimaryBtn"
                  onClick={
                    uploadResource
                  }
                >
                  Upload Resource
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}