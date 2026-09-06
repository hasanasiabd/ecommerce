// FILE: src/app/developer/admins/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import {
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
  X,
} from "lucide-react";

type Admin = {
  id: string;
  username: string | null;
  email: string;
  name: string | null;
  role: "ADMIN";
  isActive: boolean;
  createdAt: string;
};

type CreateForm = {
  username: string;
  name: string;
  email: string;
  password: string;
};

const INITIAL_FORM: CreateForm = {
  username: "",
  name: "",
  email: "",
  password: "",
};

export default function AdminManagementPage() {
  const { resolvedTheme, setTheme } =
    useTheme();

  const [admins, setAdmins] =
    useState<Admin[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showCreate, setShowCreate] =
    useState(false);

  const [form, setForm] =
    useState<CreateForm>(
      INITIAL_FORM
    );

  const [resetId, setResetId] =
    useState<string | null>(null);

  const [newPassword, setNewPassword] =
    useState("");

  async function loadAdmins() {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          "/api/developer/admins",
          {
            method: "GET",
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load administrators."
        );
      }

      setAdmins(
        Array.isArray(data.admins)
          ? data.admins
          : []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load administrators."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdmins();
  }, []);

  const filteredAdmins =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return admins;
      }

      return admins.filter(
        (admin) =>
          admin.username
            ?.toLowerCase()
            .includes(query) ||
          admin.email
            .toLowerCase()
            .includes(query) ||
          admin.name
            ?.toLowerCase()
            .includes(query)
      );
    }, [admins, search]);

  async function createAdmin(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (creating) return;

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      const response =
        await fetch(
          "/api/developer/admins",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              form
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to create administrator."
        );
      }

      setSuccess(
        "Administrator created successfully."
      );

      setForm(
        INITIAL_FORM
      );

      setShowCreate(false);

      await loadAdmins();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create administrator."
      );
    } finally {
      setCreating(false);
    }
  }

  async function changeStatus(
    id: string,
    action:
      | "activate"
      | "disable"
  ) {
    try {
      setError("");
      setSuccess("");

      const response =
        await fetch(
          `/api/developer/admins/${id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              action,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to update administrator."
        );
      }

      setSuccess(
        data.message ||
          "Administrator updated."
      );

      await loadAdmins();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update administrator."
      );
    }
  }

  async function deleteAdmin(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Delete this administrator permanently?"
      );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response =
        await fetch(
          `/api/developer/admins/${id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete administrator."
        );
      }

      setSuccess(
        "Administrator deleted successfully."
      );

      await loadAdmins();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete administrator."
      );
    }
  }

  async function resetPassword(
    id: string
  ) {
    if (
      newPassword.length < 8
    ) {
      setError(
        "Password must be at least 8 characters long."
      );

      return;
    }

    try {
      setError("");
      setSuccess("");

      const response =
        await fetch(
          `/api/developer/admins/${id}`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              action:
                "reset-password",
              password:
                newPassword,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to reset password."
        );
      }

      setSuccess(
        "Administrator password reset successfully."
      );

      setResetId(null);
      setNewPassword("");

      await loadAdmins();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to reset password."
      );
    }
  }

  const dark =
    resolvedTheme === "dark";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
                Developer Console
              </p>

              <h1 className="text-xl font-bold">
                Administrator Management
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setTheme(
                  dark
                    ? "light"
                    : "dark"
                )
              }
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition hover:bg-accent"
            >
              {dark
                ? "☀️ Light"
                : "🌙 Dark"}
            </button>

            <button
              type="button"
              onClick={loadAdmins}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium transition hover:bg-accent disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={() =>
                setShowCreate(true)
              }
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              Create Admin
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            title="Total Admins"
            value={admins.length}
          />

          <StatCard
            title="Active"
            value={
              admins.filter(
                (admin) =>
                  admin.isActive
              ).length
            }
          />

          <StatCard
            title="Disabled"
            value={
              admins.filter(
                (admin) =>
                  !admin.isActive
              ).length
            }
          />
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
            {success}
          </div>
        )}

        <div className="mb-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search by name, username or email..."
              className="w-full rounded-2xl border border-border bg-card px-11 py-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
              Loading administrators...
            </div>
          ) : filteredAdmins.length ===
            0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <ShieldCheck className="mb-4 h-10 w-10 text-muted-foreground" />

              <h2 className="text-lg font-semibold">
                No administrators found
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                Create an administrator account to
                get started.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredAdmins.map(
                (admin) => (
                  <div
                    key={admin.id}
                    className="p-5 transition hover:bg-accent/40"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                          <ShieldCheck className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">
                              {admin.name ||
                                admin.username ||
                                "Administrator"}
                            </h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                admin.isActive
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-red-500/10 text-red-500"
                              }`}
                            >
                              {admin.isActive
                                ? "Active"
                                : "Disabled"}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-muted-foreground">
                            @{admin.username ||
                              "unknown"}
                          </p>

                          <p className="mt-1 break-all text-sm text-muted-foreground">
                            {admin.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {admin.isActive ? (
                          <button
                            type="button"
                            onClick={() =>
                              changeStatus(
                                admin.id,
                                "disable"
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium transition hover:bg-accent"
                          >
                            <UserX className="h-4 w-4" />
                            Disable
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              changeStatus(
                                admin.id,
                                "activate"
                              )
                            }
                            className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-500 transition hover:bg-emerald-500/20"
                          >
                            <UserCheck className="h-4 w-4" />
                            Activate
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            setResetId(
                              resetId ===
                                admin.id
                                ? null
                                : admin.id
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium transition hover:bg-accent"
                        >
                          <KeyRound className="h-4 w-4" />
                          Reset Password
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteAdmin(
                              admin.id
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>

                    {resetId ===
                      admin.id && (
                      <div className="mt-5 rounded-2xl border border-border bg-background p-4">
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <input
                            type="password"
                            value={
                              newPassword
                            }
                            onChange={(
                              event
                            ) =>
                              setNewPassword(
                                event.target
                                  .value
                              )
                            }
                            placeholder="New password"
                            className="flex-1 rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-indigo-500"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              resetPassword(
                                admin.id
                              )
                            }
                            className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500"
                          >
                            Save
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setResetId(
                                null
                              );
                              setNewPassword(
                                ""
                              );
                            }}
                            className="rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-accent"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  Create Administrator
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Create a dedicated admin account.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(false)
                }
                className="rounded-xl p-2 transition hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={createAdmin}
              className="space-y-4"
            >
              <input
                required
                value={form.name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    name:
                      event.target.value,
                  })
                }
                placeholder="Full name"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />

              <input
                required
                value={form.username}
                onChange={(event) =>
                  setForm({
                    ...form,
                    username:
                      event.target.value
                        .toLowerCase(),
                  })
                }
                placeholder="username"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />

              <input
                required
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({
                    ...form,
                    email:
                      event.target.value
                        .toLowerCase(),
                  })
                }
                placeholder="admin@example.com"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />

              <input
                required
                type="password"
                minLength={8}
                value={form.password}
                onChange={(event) =>
                  setForm({
                    ...form,
                    password:
                      event.target.value,
                  })
                }
                placeholder="Password"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowCreate(false)
                  }
                  className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-accent"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {creating
                    ? "Creating..."
                    : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}