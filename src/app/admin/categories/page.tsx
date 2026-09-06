// FILE: src/app/admin/categories/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Edit3,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] =
    useState<Category[]>([]);

  const [search, setSearch] =
    useState("");

  const [name, setName] =
    useState("");

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  async function loadCategories() {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          "/api/admin/categories",
          {
            cache: "no-store",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to load categories."
        );
      }

      setCategories(
        data.categories || []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load categories."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return categories;
      }

      return categories.filter(
        (category) =>
          category.name
            .toLowerCase()
            .includes(query) ||
          category.slug
            .toLowerCase()
            .includes(query)
      );
    }, [
      categories,
      search,
    ]);

  function openCreate() {
    setEditingId(null);
    setName("");
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEdit(
    category: Category
  ) {
    setEditingId(
      category.id
    );

    setName(
      category.name
    );

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  async function saveCategory(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (saving) return;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response =
        await fetch(
          editingId
            ? `/api/admin/categories/${editingId}`
            : "/api/admin/categories",
          {
            method:
              editingId
                ? "PUT"
                : "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              name,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save category."
        );
      }

      setSuccess(
        data.message ||
          "Category saved successfully."
      );

      setShowForm(false);
      setName("");
      setEditingId(null);

      await loadCategories();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save category."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCategory(
    id: string
  ) {
    if (
      !window.confirm(
        "Delete this category?"
      )
    ) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response =
        await fetch(
          `/api/admin/categories/${id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete category."
        );
      }

      setSuccess(
        data.message ||
          "Category deleted."
      );

      await loadCategories();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete category."
      );
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
              <Boxes className="h-3.5 w-3.5" />
              Catalog Structure
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              Categories
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Organize products into clean, searchable
              categories.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Stat
            title="Total Categories"
            value={categories.length}
          />

          <Stat
            title="Total Products"
            value={categories.reduce(
              (
                total,
                category
              ) =>
                total +
                category._count
                  .products,
              0
            )}
          />

          <Stat
            title="Empty Categories"
            value={
              categories.filter(
                (category) =>
                  category._count
                    .products === 0
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

        <div className="mb-5 relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search categories..."
            className="w-full rounded-2xl border border-border bg-card px-11 py-3.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Loading categories...
            </div>
          ) : filteredCategories.length ===
            0 ? (
            <div className="p-12 text-center">
              <Boxes className="mx-auto h-10 w-10 text-muted-foreground" />

              <h2 className="mt-4 font-semibold">
                No categories found
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Create your first category.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredCategories.map(
                (category) => (
                  <div
                    key={category.id}
                    className="flex flex-col gap-4 p-5 transition hover:bg-accent/30 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                        <Boxes className="h-5 w-5" />
                      </div>

                      <div>
                        <h2 className="font-semibold">
                          {category.name}
                        </h2>

                        <p className="mt-1 text-xs text-muted-foreground">
                          /{category.slug}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {category._count.products}{" "}
                          {category._count.products ===
                          1
                            ? "product"
                            : "products"}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEdit(
                            category
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-accent"
                      >
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteCategory(
                            category.id
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/20"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  {editingId
                    ? "Edit Category"
                    : "Create Category"}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Give this category a clear name.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                className="rounded-xl p-2 hover:bg-accent"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={saveCategory}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="category-name"
                  className="mb-2 block text-sm font-medium"
                >
                  Category Name
                </label>

                <input
                  id="category-name"
                  required
                  autoFocus
                  value={name}
                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }
                  placeholder="Electronics"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="rounded-xl border border-border bg-background p-4 text-xs leading-5 text-muted-foreground">
                The URL slug will be generated automatically
                from the category name.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowForm(false)
                  }
                  className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-accent"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update"
                      : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function Stat({
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