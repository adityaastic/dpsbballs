"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminPageHeader, {
  AdminCard,
  useConfirmDelete,
  useToast,
} from "@/components/admin/AdminUI";

type Product = {
  _id: string;
  slug: string;
  title: string;
  short?: string;
  published: boolean;
  order: number;
  updatedAt: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { show, ToastContainer } = useToast();
  const { confirm, Dialog } = useConfirmDelete();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(data.products || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onDelete = (id: string, title: string) => {
    confirm(`Delete product "${title}"? This cannot be undone.`, async () => {
      try {
        const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete");
        setProducts((prev) => prev.filter((p) => p._id !== id));
        show("Product deleted", "success");
      } catch (e: any) {
        show(e.message || "Delete failed", "error");
      }
    });
  };

  const togglePublish = async (p: Product) => {
    try {
      const res = await fetch(`/api/admin/products/${p._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !p.published }),
      });
      if (!res.ok) throw new Error("Failed");
      setProducts((prev) =>
        prev.map((x) =>
          x._id === p._id ? { ...x, published: !x.published } : x
        )
      );
      show("Updated", "success");
    } catch (e: any) {
      show(e.message, "error");
    }
  };

  return (
    <>
      <ToastContainer />
      <Dialog />
      <AdminPageHeader
        title="Products"
        description={`${products.length} product${products.length === 1 ? "" : "s"} in catalogue`}
        actions={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-md"
          >
            <span>＋</span> Add Product
          </Link>
        }
      />

      <AdminCard className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-sm text-slate-500">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-slate-500 mb-4">
              No products yet. Start by adding your first product.
            </div>
            <Link
              href="/admin/products/new"
              className="inline-block px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-md"
            >
              Add Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Slug</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Updated</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p, i) => (
                  <tr key={p._id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 text-slate-500">{i + 1}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{p.title}</div>
                    {p.short && (
                      <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {p.short}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                      {p.slug}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePublish(p)}
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border ${
                          p.published
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            p.published ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        {p.published ? "Live" : "Draft"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {new Date(p.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/products/${p.slug}`}
                        target="_blank"
                        className="inline-block px-2 py-1 text-xs text-slate-600 hover:text-slate-900"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/products/${p._id}`}
                        className="inline-block px-2 py-1 text-xs text-amber-700 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => onDelete(p._id, p.title)}
                        className="inline-block px-2 py-1 text-xs text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </>
  );
}
