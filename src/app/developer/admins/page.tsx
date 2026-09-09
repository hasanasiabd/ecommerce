// FILE: src/app/developer/admins/page.tsx

"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Trash2,
  KeyRound,
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

type FormState = {
  username: string;
  name: string;
  email: string;
  password: string;
};

const emptyForm: FormState = {
  username: "",
  name: "",
  email: "",
  password: "",
};

export default function AdminManagementPage() {
  const [admins, setAdmins] =
    useState<Admin[]>([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [showCreate, setShowCreate] =
    useState(false);

  const [form, setForm] =
    useState<FormState>(
      emptyForm
    );

  const [resetId, setResetId] =
    useState<string | null>(null);

  const [resetPassword, setResetPassword] =
    useState("");

  async function loadAdmins() {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          "/api/developer/admins",
          {
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load admins."
        );
      }

      setAdmins(
        data.admins || []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load admins."
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
        search
          .trim()
          .toLowerCase();

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
    }, [
      admins,
      search,
    ]);

  async function createAdmin(
    event: React.FormEvent
  ) {
    event.preventDefault();

    try {
      setSubmitting(true);
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
            "Unable to create admin."
        );
      }

      setSuccess(
        "Administrator created successfully."
      );

      setForm(emptyForm);
      setShowCreate(false);

      await loadAdmins();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create admin."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function updateAdmin(
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
            "Unable to update admin."
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
          : "Unable to update admin."
      );
    }
  }

  async function deleteAdmin(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to permanently delete this administrator?"
      );

    if (!confirmed) {
      return;
    }

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
            "Unable to delete admin."
        );
      }

      setSuccess(
        "Administrator deleted."
      );

      await loadAdmins();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete admin."
      );
    }
  }

  async function resetAdminPassword(
    id: string
  ) {
    if (
      resetPassword.length < 8
    ) {
      setError(
        "New password must be at least 8 characters."
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
                resetPassword,
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
      setResetPassword("");

      await loadAdmins();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to reset password."
      );
    }
  }

  return (
    <main className="w-full">
      {/* =====================================================
          MAIN CONTENT
         ===================================================== */}

      <div className="w-full">
        {/* Page Header */}
        <div className="mb-8 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
                <ShieldCheck className="h-4 w-4" />

                Developer Control
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Administrator Management
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Create and manage administrator
                accounts for MyShop.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setShowCreate(
                  true
                )
              }
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-2xl
                bg-indigo-600
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-indigo-600/20
                transition
                hover:bg-indigo-500
                sm:w-auto
              "
            >
              <Plus className="h-4 w-4" />

              Create Admin
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-500">
            {success}
          </div>
        )}

        {/* Search / Refresh */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search administrators..."
              className="
                w-full
                rounded-2xl
                border
                border-border
                bg-card
                py-3
                pl-11
                pr-4
                text-sm
                outline-none
                transition
                focus:border-indigo-500
                focus:ring-2
                focus:ring-indigo-500/20
              "
            />
          </div>

          <button
            type="button"
            onClick={
              loadAdmins
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-2xl
              border
              border-border
              bg-card
              px-4
              py-3
              text-sm
              font-medium
              transition
              hover:bg-accent
            "
          >
            <RefreshCcw className="h-4 w-4" />

            Refresh
          </button>
        </div>

        {/* Administrator List */}
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <RefreshCcw className="h-4 w-4 animate-spin" />

                Loading administrators...
              </div>
            </div>
          ) : filteredAdmins.length ===
            0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <ShieldCheck className="mb-4 h-10 w-10 text-muted-foreground" />

              <h3 className="font-semibold">
                No administrators found
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Create your first administrator
                account from the button above.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredAdmins.map(
                (admin) => (
                  <div
                    key={admin.id}
                    className="
                      p-4
                      transition
                      hover:bg-accent/40
                      sm:p-5
                    "
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                          <ShieldCheck className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate font-semibold">
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

                          <p className="mt-1 truncate text-sm text-muted-foreground">
                            @
                            {admin.username ||
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
                              updateAdmin(
                                admin.id,
                                "disable"
                              )
                            }
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-xl
                              border
                              border-border
                              px-3
                              py-2
                              text-sm
                              font-medium
                              transition
                              hover:bg-accent
                            "
                          >
                            <UserX className="h-4 w-4" />

                            Disable
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              updateAdmin(
                                admin.id,
                                "activate"
                              )
                            }
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-xl
                              border
                              border-emerald-500/20
                              bg-emerald-500/10
                              px-3
                              py-2
                              text-sm
                              font-medium
                              text-emerald-500
                              transition
                              hover:bg-emerald-500/20
                            "
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
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-border
                            px-3
                            py-2
                            text-sm
                            font-medium
                            transition
                            hover:bg-accent
                          "
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
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-red-500/20
                            bg-red-500/10
                            px-3
                            py-2
                            text-sm
                            font-medium
                            text-red-500
                            transition
                            hover:bg-red-500/20
                          "
                        >
                          <Trash2 className="h-4 w-4" />

                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Reset Password */}
                    {resetId ===
                      admin.id && (
                      <div className="mt-5 rounded-2xl border border-border bg-background p-4">
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <input
                            type="password"
                            value={
                              resetPassword
                            }
                            onChange={(
                              event
                            ) =>
                              setResetPassword(
                                event.target
                                  .value
                              )
                            }
                            placeholder="New password"
                            className="
                              flex-1
                              rounded-xl
                              border
                              border-border
                              bg-card
                              px-4
                              py-3
                              text-sm
                              outline-none
                              focus:border-indigo-500
                            "
                          />

                          <button
                            type="button"
                            onClick={() =>
                              resetAdminPassword(
                                admin.id
                              )
                            }
                            className="
                              rounded-xl
                              bg-indigo-600
                              px-4
                              py-3
                              text-sm
                              font-semibold
                              text-white
                              transition
                              hover:bg-indigo-500
                            "
                          >
                            Save Password
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setResetId(
                                null
                              );
                              setResetPassword(
                                ""
                              );
                            }}
                            className="
                              rounded-xl
                              border
                              border-border
                              px-4
                              py-3
                              text-sm
                              font-medium
                              transition
                              hover:bg-accent
                            "
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

      {/* =====================================================
          CREATE ADMIN MODAL
         ===================================================== */}

      {showCreate && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-end
            justify-center
            bg-black/60
            px-3
            py-3
            backdrop-blur-sm
            sm:items-center
            sm:px-4
            sm:py-6
          "
        >
          <div
            className="
              max-h-[92vh]
              w-full
              max-w-lg
              overflow-y-auto
              rounded-3xl
              border
              border-border
              bg-card
              p-5
              shadow-2xl
              sm:max-h-[90vh]
              sm:p-6
            "
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-bold">
                  Create Administrator
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Give this person their own admin
                  credentials.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(
                    false
                  )
                }
                aria-label="Close create administrator form"
                className="
                  inline-flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  transition
                  hover:bg-accent
                "
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={
                createAdmin
              }
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
                className="
                  w-full
                  rounded-xl
                  border
                  border-border
                  bg-background
                  px-4
                  py-3
                  text-sm
                  outline-none
                  focus:border-indigo-500
                "
              />

              <input
                required
                value={
                  form.username
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    username:
                      event.target.value,
                  })
                }
                placeholder="username"
                className="
                  w-full
                  rounded-xl
                  border
                  border-border
                  bg-background
                  px-4
                  py-3
                  text-sm
                  outline-none
                  focus:border-indigo-500
                "
              />

              <input
                required
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm({
                    ...form,
                    email:
                      event.target.value,
                  })
                }
                placeholder="admin@example.com"
                className="
                  w-full
                  rounded-xl
                  border
                  border-border
                  bg-background
                  px-4
                  py-3
                  text-sm
                  outline-none
                  focus:border-indigo-500
                "
              />

              <input
                required
                type="password"
                minLength={8}
                value={
                  form.password
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    password:
                      event.target.value,
                  })
                }
                placeholder="Password (minimum 8 characters)"
                className="
                  w-full
                  rounded-xl
                  border
                  border-border
                  bg-background
                  px-4
                  py-3
                  text-sm
                  outline-none
                  focus:border-indigo-500
                "
              />

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(
                      false
                    );
                    setForm(
                      emptyForm
                    );
                  }}
                  className="
                    flex-1
                    rounded-xl
                    border
                    border-border
                    px-4
                    py-3
                    text-sm
                    font-medium
                    transition
                    hover:bg-accent
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  className="
                    flex-1
                    rounded-xl
                    bg-indigo-600
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-indigo-500
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {submitting
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
