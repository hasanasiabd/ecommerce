// FILE: src/app/admin/products/page.tsx

"use client";

import { useEffect, useState } from "react";
import {
  ImagePlus,
  PackagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";

type Category = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  images: string;
  category: Category;
  categoryId: string;
};

type UploadedImage = {
  url: string;
  publicId: string;
};

type FormState = {
  title: string;
  description: string;
  price: string;
  stock: string;
  categoryId: string;
  images: string;
};

const INITIAL_FORM: FormState = {
  title: "",
  description: "",
  price: "",
  stock: "0",
  categoryId: "",
  images: "[]",
};

export default function AdminProductsPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [uploadedImages, setUploadedImages] =
  useState<UploadedImage[]>([]);

  const [search, setSearch] =
    useState("");

  const [form, setForm] =
    useState<FormState>(
      INITIAL_FORM
    );

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function loadData() {
    try {
      setLoading(true);

      const [
        productResponse,
        categoryResponse,
      ] = await Promise.all([
        fetch(
          "/api/admin/products",
          {
            cache: "no-store",
          }
        ),
        fetch(
          "/api/categories",
          {
            cache: "no-store",
          }
        ),
      ]);

      const productData =
        await productResponse.json();

      const categoryData =
        await categoryResponse.json();

      if (!productResponse.ok) {
        throw new Error(
          productData.error ||
            "Unable to load products."
        );
      }

      if (!categoryResponse.ok) {
        throw new Error(
          categoryData.error ||
            "Unable to load categories."
        );
      }

      setProducts(
        productData.products || []
      );

      setCategories(
        categoryData.categories || []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function uploadImages(
  files: FileList | null
) {
  if (!files?.length) return;

  setError("");

  try {
    const selectedFiles =
      Array.from(files);

    if (
      uploadedImages.length +
        selectedFiles.length >
      8
    ) {
      throw new Error(
        "A product can have a maximum of 8 images."
      );
    }

    for (const file of selectedFiles) {
      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );

      const response =
        await fetch(
          "/api/admin/upload",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to upload image."
        );
      }

      setUploadedImages(
        (current) => [
          ...current,
          data.image,
        ]
      );
    }
  } catch (error) {
    setError(
      error instanceof Error
        ? error.message
        : "Unable to upload image."
    );
  }
}

  function openCreate() {
    setEditingId(null);

    setForm({
      ...INITIAL_FORM,
      categoryId:
        categories[0]?.id || "",
    });

    setUploadedImages([]);

    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEdit(
    product: Product
  ) {
    setEditingId(
      product.id
    );

    setForm({
      title: product.title,
      description:
        product.description,
      price:
        String(product.price),
      stock:
        String(product.stock),
      categoryId:
        product.categoryId,
      images:
        product.images || "[]",
    });

    try {
      const parsed =
        JSON.parse(
          product.images || "[]"
        );

      if (
        Array.isArray(parsed)
      ) {
        setUploadedImages(
          parsed
            .filter(
              (item): item is string =>
                typeof item ===
                "string"
            )
            .map(
              (url) => ({
                url,
                publicId: "",
              })
            )
        );
      } else {
        setUploadedImages([]);
      }
    } catch {
      setUploadedImages([]);
    }
    setMessage("");
    setError("");
    setShowForm(true);
  }

  async function saveProduct(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (saving) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const url =
        editingId
          ? `/api/admin/products/${editingId}`
          : "/api/admin/products";

      const method =
        editingId
          ? "PUT"
          : "POST";

      const response =
        await fetch(url, {
          method,
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            price: form.price,
            stock: form.stock,
            categoryId: form.categoryId,
            images: JSON.stringify(
              uploadedImages.map(
                (image) => image.url
              )
            ),
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to save product."
        );
      }

      setMessage(
        editingId
          ? "Product updated successfully."
          : "Product created successfully."
      );

      setUploadedImages([]);
      setEditingId(null);
      setForm(INITIAL_FORM);
      setShowForm(false);

      await loadData();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(
    id: string
  ) {
    if (
      !window.confirm(
        "Delete this product permanently?"
      )
    ) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const response =
        await fetch(
          `/api/admin/products/${id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to delete product."
        );
      }

      setMessage(
        "Product deleted successfully."
      );

      await loadData();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete product."
      );
    }
  }

  const filtered =
    products.filter(
      (product) => {
        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) {
          return true;
        }

        return (
          product.title
            .toLowerCase()
            .includes(query) ||
          product.category.name
            .toLowerCase()
            .includes(query)
        );
      }
    );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-500">
              <PackagePlus className="h-3.5 w-3.5" />
              Store Management
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              Products
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Create, edit and manage your store catalog.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
            {message}
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
            placeholder="Search products..."
            className="w-full rounded-2xl border border-border bg-card px-11 py-3.5 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Loading products...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <PackagePlus className="mx-auto h-10 w-10 text-muted-foreground" />

              <h2 className="mt-4 font-semibold">
                No products
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Add your first product.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(
                (product) => (
                  <div
                    key={product.id}
                    className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="min-w-0">
                      <h2 className="font-semibold">
                        {product.title}
                      </h2>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {product.category.name}
                      </p>

                      <p className="mt-2 text-sm">
                        ${product.price.toFixed(2)}
                        {" · "}
                        Stock: {product.stock}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEdit(product)
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium hover:bg-accent"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteProduct(
                            product.id
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {editingId
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Enter the product details below.
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
              onSubmit={saveProduct}
              className="space-y-4"
            >
              <input
                required
                value={form.title}
                onChange={(event) =>
                  setForm({
                    ...form,
                    title:
                      event.target.value,
                  })
                }
                placeholder="Product title"
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />

              <textarea
                required
                rows={5}
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description:
                      event.target.value,
                  })
                }
                placeholder="Product description"
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      price:
                        event.target.value,
                    })
                  }
                  placeholder="Price"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />

                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      stock:
                        event.target.value,
                    })
                  }
                  placeholder="Stock"
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <select
                required
                value={form.categoryId}
                onChange={(event) =>
                  setForm({
                    ...form,
                    categoryId:
                      event.target.value,
                  })
                }
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-indigo-500"
              >
                <option value="">
                  Select category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Product Images
                </label>

                <label
                  className="
                    flex cursor-pointer
                    flex-col items-center
                    justify-center
                    rounded-2xl
                    border border-dashed
                    border-border
                    bg-background
                    px-6 py-8
                    text-center
                    transition
                    hover:border-indigo-500/50
                    hover:bg-accent
                  "
                >
                  <ImagePlus className="h-8 w-8 text-indigo-500" />

                  <span className="mt-3 text-sm font-semibold">
                    Choose product images
                  </span>

                  <span className="mt-1 text-xs text-muted-foreground">
                    PNG, JPG, WEBP — maximum 10MB each
                  </span>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    className="hidden"
                    onChange={(event) =>
                      uploadImages(
                        event.target.files
                      )
                    }
                  />
                </label>

                {uploadedImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {uploadedImages.map(
                      (image, index) => (
                        <div
                          key={`${image.publicId}-${index}`}
                          className="group relative overflow-hidden rounded-2xl border border-border bg-muted"
                        >
                          <img
                            src={image.url}
                            alt={`Product image ${index + 1}`}
                            className="aspect-square w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              setUploadedImages(
                                (current) =>
                                  current.filter(
                                    (_, imageIndex) =>
                                      imageIndex !==
                                      index
                                  )
                              );
                            }}
                            className="
                              absolute right-2 top-2
                              rounded-lg
                              bg-black/60
                              px-2 py-1
                              text-xs font-semibold
                              text-white
                              opacity-0
                              transition
                              group-hover:opacity-100
                            "
                          >
                            Remove
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
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
                      ? "Update Product"
                      : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}