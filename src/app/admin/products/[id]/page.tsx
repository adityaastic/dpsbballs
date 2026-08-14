"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminPageHeader, { useToast } from "@/components/admin/AdminUI";
import ProductForm from "@/components/admin/ProductForm";
import { useParams } from "next/navigation";

export default function AdminProductEditPage() {
  const params = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { show, ToastContainer } = useToast();

  useEffect(() => {
    if (!params?.id) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/products/${params.id}`);
        const data = await res.json();
        if (!res.ok || !data.product) throw new Error(data.error || "Not found");
        setProduct(data.product);
      } catch (e: any) {
        show(e.message, "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [params?.id, show]);

  return (
    <>
      <ToastContainer />
      <AdminPageHeader
        title={loading ? "Loading..." : product ? `Edit: ${product.title}` : "Edit Product"}
        description={!loading && product ? `Slug: ${product.slug}` : ""}
        actions={
          <div className="flex gap-2">
            <Link
              href="/admin/products"
              className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm rounded-md hover:bg-slate-50"
            >
              ← Back
            </Link>
            {product && (
              <Link
                href={`/products/${product.slug}`}
                target="_blank"
                className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm rounded-md hover:bg-slate-50"
              >
                Preview ↗
              </Link>
            )}
          </div>
        }
      />

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500">
          Loading product...
        </div>
      ) : product ? (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <ProductForm mode="edit" initial={product} />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-red-600">
          Product not found
        </div>
      )}
    </>
  );
}
