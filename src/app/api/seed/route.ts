import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";

export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json({
      ...result,
      success: true,
      message: "Supabase database seeded successfully. Default admin: admin / Admin@12345",
    });
  } catch (err: unknown) {
    console.error("Seed error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Seed failed" },
      { status: 500 }
    );
  }
}
