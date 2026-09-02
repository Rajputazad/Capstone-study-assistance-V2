"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import AdminShell from "@/components/AdminShell";
import { Icon } from "@/components/Icons";

import {
  StatusBadge,
} from "@/components/Badge";

import {
  createAdmin as createAdminApi,
  fetchAdmins,
  toggleAdmin,
} from "@/lib/api";

import type {
  AdminUser,
} from "@/lib/types";

export default function AdminManagement() {
  const [rows, setRows] =
    useState<AdminUser[]>([]);

  const [error, setError] =
    useState("");

  useEffect(() => {
    fetchAdmins()
      .then(setRows)
      .catch((err) =>
        setError(err.message)
      );
  }, []);

  const [open, setOpen] =
    useState(false);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");


  async function toggle(
    id: string
  ) {
    try {
      const updated =
        await toggleAdmin(id);

      setRows((current) =>
        current.map(
          (admin) =>
            admin.id === id
              ? updated
              : admin
        )
      );
    } catch (err) {
      setError(
        (err as Error).message
      );
    }
  }

  function closeModal() {
    setOpen(false);
    setName("");
    setEmail("");
    setPassword("");
  }

  async function createAdmin(
    event: FormEvent
  ) {
    event.preventDefault();

    if (
      !name.trim() ||
      !email.trim() ||
      password.length < 8
    ) {
      return;
    }

    try {
      const admin =
        await createAdminApi({
          name: name.trim(),
          email: email.trim(),
          password,
        });

      setRows(
        (current) => [
          ...current,
          admin,
        ]
      );

      closeModal();
    } catch (err) {
      setError(
        (err as Error).message
      );
    }
  }

  return (
    <AdminShell>
      <div className="page">
        <div className="adminHeader">
          <div>
            <h1 className="pageTitle">
              Admin Management
            </h1>

            <p
              className="pageSub"
              style={{
                marginBottom: 0,
              }}
            >
              {rows.length} administrator accounts
            </p>

            {error && (
              <p className="loginError">
                {error}
              </p>
            )}
          </div>

          <button
            className="addAdminBtn"
            type="button"
            onClick={() =>
              setOpen(true)
            }
          >
            <Icon
              name="plus"
              size={20}
            />

            Add Admin
          </button>
        </div>

        <div className="tablePanel">
          <table>
            <thead>
              <tr>
                <th>
                  ADMIN NAME
                </th>

                <th>EMAIL</th>

                <th>ROLE</th>

                <th>STATUS</th>

                <th>
                  LAST LOGIN
                </th>

                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {rows.map(
                (admin) => (
                  <tr
                    key={
                      admin.id
                    }
                  >
                    <td>
                      <div className="adminNameCell">
                        <div className="miniAvatar dark">
                          {admin.name.startsWith(
                            "Prof."
                          )
                            ? "P"
                            : "D"}
                        </div>

                        {
                          admin.name
                        }
                      </div>
                    </td>

                    <td>
                      {
                        admin.email
                      }
                    </td>

                    <td>
                      <span className="roleBadge admin">
                        Admin
                      </span>
                    </td>

                    <td>
                      <StatusBadge
                        value={
                          admin.status
                        }
                      />
                    </td>

                    <td>
                      <span className="pre">
                        {
                          admin.lastLogin
                        }
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`toggleAction ${
                          admin.status ===
                          "Active"
                            ? "off"
                            : "on"
                        }`}
                        onClick={() =>
                          toggle(
                            admin.id
                          )
                        }
                      >
                        {admin.status ===
                        "Active"
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {open && (
          <div
            className="modalBackdrop"
            onMouseDown={
              closeModal
            }
          >
            <form
              className="figAdminModal"
              onSubmit={
                createAdmin
              }
              onMouseDown={(
                event
              ) =>
                event.stopPropagation()
              }
            >
              <div className="figModalHead">
                <h2>
                  Add Administrator
                </h2>

                <button
                  className="modalX"
                  type="button"
                  onClick={
                    closeModal
                  }
                >
                  ×
                </button>
              </div>

              <div className="figAdminBody">
                <div className="figField">
                  <label>
                    Full Name
                  </label>

                  <input
                    placeholder="e.g. Dr. Jane Smith"
                    value={name}
                    onChange={(
                      event
                    ) =>
                      setName(
                        event
                          .target
                          .value
                      )
                    }
                  />
                </div>

                <div className="figField">
                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="jane.smith@swinburne.edu.au"
                    value={email}
                    onChange={(
                      event
                    ) =>
                      setEmail(
                        event
                          .target
                          .value
                      )
                    }
                  />
                </div>

                <div className="figField">
                  <label>
                    Password
                  </label>

                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={
                      password
                    }
                    onChange={(
                      event
                    ) =>
                      setPassword(
                        event
                          .target
                          .value
                      )
                    }
                  />
                </div>

                <div className="figField">
                  <label>
                    Role
                  </label>

                  <div className="singleRole">
                    <span className="radioDot">
                      <span />
                    </span>

                    <strong>
                      Admin
                    </strong>
                  </div>
                </div>
              </div>

              <div className="adminModalButtons">
                <button
                  type="button"
                  className="adminCancel"
                  onClick={
                    closeModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="adminCreate"
                  disabled={
                    !name.trim() ||
                    !email.trim() ||
                    password.length <
                      8
                  }
                >
                  Create Admin Account
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminShell>
  );
}