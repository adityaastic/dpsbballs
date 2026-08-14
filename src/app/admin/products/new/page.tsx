"use client";

import Link from "next/link";
import AdminPageHeader from "@/components/admin/AdminUI";
import ProductForm from "@/components/admin/ProductForm";

export default function AdminProductNewPage() {
  return (
    <>
      <AdminPageHeader
        title="Add Product"
        description="Create a new product in the catalogue."
        actions={
          <Link
            href="/admin/products"
            className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm rounded-md hover:bg-slate-50"
          >
            ← Back
          </Link>
        }
      />
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <ProductForm mode="new" />
      </div>
    </>
  );
}
