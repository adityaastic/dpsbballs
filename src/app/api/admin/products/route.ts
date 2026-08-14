import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";
import { dbConnect } from "@/lib/db";
import { Product } from "@/models/Product";
import { requireAuth } from "@/lib/authGuard";

export async function GET() {
  try {
    await dbConnect();
    const products = await Product.find().sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { response: authRes } = await requireAuth("editor");
    if (authRes) return authRes;

    const body = await request.json();
    await dbConnect();

    const slug = body.slug || slugify(body.title, { lower: true, strict: true });
    const product = new Product({
      ...body,
      slug,
    });
    await product.save();

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
