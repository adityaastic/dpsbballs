"use client";

import { use } from "react";
import BlogPostEditor from "@/components/admin/BlogPostEditor";

export default function EditBlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return <BlogPostEditor initialSlug={slug} />;
}
